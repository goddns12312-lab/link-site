import { proxyFetch, injectIntoHtml } from './_shared.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(204).end();
    return;
  }

  const fullPath = req.query.__path || '';
  const match = fullPath.match(/^([^\/]+)(\/.*)?$/);
  if (!match) { res.status(400).send('Bad path'); return; }

  const host = match[1];
  const restPath = match[2] || '/';
  const qs = req.query;
  delete qs.__path;
  const qsStr = Object.keys(qs).length ? '?' + new URLSearchParams(qs).toString() : '';
  const target = 'https://' + host + restPath + qsStr;

  try {
    let reqBody;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      reqBody = await new Promise((resolve) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
      });
    }

    const resp = await proxyFetch(target, 'https://' + host + '/', {
      method: req.method, body: reqBody, contentType: req.headers['content-type']
    });

    const ct = resp.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (ct.includes('text/html')) {
      let html = await resp.text();
      const sUrl = new URL(target);
      const sPathDir = sUrl.pathname.substring(0, sUrl.pathname.lastIndexOf('/') + 1) || '/';
      const isFullPage = /<!doctype|<html[\s>]/i.test(html);
      if (isFullPage) {
        html = injectIntoHtml(html, 'https://' + host, host, sPathDir);
      } else {
        html = html.replace(/((?:src|href|action|poster)\s*=\s*["'])\/(?!\/|s\/)/gi, `$1/s/${host}/`);
        html = html.replace(/(url\s*\(\s*['"]?)\/(?!\/|s\/)/gi, `$1/s/${host}/`);
      }
      res.status(200).send(html);
    } else {
      const buf = Buffer.from(await resp.arrayBuffer());
      res.status(200).send(buf);
    }
  } catch (e) {
    res.status(502).send('Proxy error: ' + e.message);
  }
}
