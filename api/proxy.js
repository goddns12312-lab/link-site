import { proxyFetch, injectIntoHtml } from './_shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const target = url.searchParams.get('url');
  if (!target) { res.status(400).send('Missing url param'); return; }

  try {
    const ref = url.searchParams.get('ref');
    const resp = await proxyFetch(target, ref || undefined);
    const ct = resp.headers.get('content-type') || 'text/html';
    res.setHeader('Content-Type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (ct.includes('text/html')) {
      let html = await resp.text();
      const u = new URL(target);
      const pathDir = u.pathname.substring(0, u.pathname.lastIndexOf('/') + 1) || '/';
      html = injectIntoHtml(html, u.origin, u.hostname, pathDir);
      res.status(200).send(html);
    } else {
      const buf = Buffer.from(await resp.arrayBuffer());
      res.status(200).send(buf);
    }
  } catch (e) {
    res.status(502).send('Proxy error: ' + e.message);
  }
}
