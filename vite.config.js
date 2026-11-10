import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function proxyFetch(target, referer, opts) {
  const hdrs = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
  };
  if (referer) hdrs['Referer'] = referer;
  if (opts?.contentType) hdrs['Content-Type'] = opts.contentType;
  const fetchOpts = { headers: hdrs, redirect: 'follow' };
  if (opts?.method) fetchOpts.method = opts.method;
  if (opts?.body) fetchOpts.body = opts.body;
  return fetch(target, fetchOpts);
}

function buildInjectedScript(realOrigin) {
  return `<script>(function(){
/* 팝업 킬러 (비디오 플레이어 제외) */
var S=new WeakSet;function isPlayer(el){return el.tagName==="VIDEO"||el.classList.contains("art-video-player")||el.id==="video-container"||!!el.querySelector("video")||!!el.closest(".art-video-player")||!!el.closest("#video-container")}
function k(){document.querySelectorAll("*").forEach(function(el){if(S.has(el))return;var cs=getComputedStyle(el);if(cs.position!=="fixed"&&cs.position!=="absolute")return;var z=parseInt(cs.zIndex||0);if(z<10)return;var w=el.offsetWidth,h=el.offsetHeight;if(w<window.innerWidth*0.25||h<window.innerHeight*0.25)return;if(isPlayer(el))return;S.add(el);el.style.setProperty("display","none","important")})}
[500,1500,3000,5000].forEach(function(ms){setTimeout(k,ms)});
new MutationObserver(function(){setTimeout(k,200)}).observe(document.documentElement,{childList:true,subtree:true});
/* 페이지 원본 주소 */
var __ref='${realOrigin}';
var __host=(function(){try{return new URL(__ref).hostname}catch(e){return ''}})();
/* same-origin이지만 Vite 경로가 아닌 요청을 원본 호스트로 리라이트 */
function __rewriteSameOrigin(u){if(u.origin===location.origin&&__host&&!u.pathname.startsWith('/proxy')&&!u.pathname.startsWith('/s/')&&!u.pathname.startsWith('/src/')&&!u.pathname.startsWith('/@')&&!u.pathname.startsWith('/node_modules/')&&!u.pathname.startsWith('/banners')&&u.pathname!=='/banners.json'&&u.pathname!=='/'){return location.origin+'/s/'+__host+u.pathname+u.search}return null}
/* 링크→프록시 변환 */
function toProxy(url){
  try{var u=new URL(url,location.href);if(u.origin===location.origin&&(u.pathname.startsWith('/proxy')||u.pathname.startsWith('/s/')))return null;if(u.protocol==='http:'||u.protocol==='https:'){var p=location.origin+'/proxy?url='+encodeURIComponent(u.href);if(__ref)p+='&ref='+encodeURIComponent(__ref);return p}}catch(e){}
  return null;
}
/* a 태그 클릭 인터셉터 */
document.addEventListener('click',function(e){
  var a=e.target.closest('a');if(!a||!a.href)return;
  var p=toProxy(a.href);if(p){e.preventDefault();e.stopPropagation();location.href=p}
},true);
/* form submit 인터셉터 */
document.addEventListener('submit',function(e){
  var f=e.target;if(!f||!f.action)return;var p=toProxy(f.action);if(p){f.action=p}
},true);
/* window.open 인터셉터 */
var _open=window.open;window.open=function(url){
  var p=toProxy(url);return _open.call(window,p||url,arguments[1],arguments[2]);
};
/* iframe src 인터셉터 - 모든 외부 도메인 프록시 */
var _oSA=Element.prototype.setAttribute;
Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='IFRAME'&&typeof v==='string'){var p=toProxy(v);if(p)return _oSA.call(this,n,p)}return _oSA.call(this,n,v)};
try{var _sd=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'src');if(_sd&&_sd.set){Object.defineProperty(HTMLIFrameElement.prototype,'src',{get:_sd.get,set:function(v){if(typeof v==='string'){var p=toProxy(v);if(p){_sd.set.call(this,p);return}}_sd.set.call(this,v)},configurable:true,enumerable:true})}}catch(e){}
/* fetch 인터셉터 - 외부 도메인 + same-origin 비Vite 경로 프록시 경유 */
var _fetch=window.fetch;
window.fetch=function(input,init){
  var url=typeof input==='string'?input:(input instanceof Request?input.url:String(input));
  try{var u=new URL(url,location.href);var nUrl=null;
    if(u.origin!==location.origin&&(u.protocol==='http:'||u.protocol==='https:'))nUrl=location.origin+'/s/'+u.host+u.pathname+u.search;
    else nUrl=__rewriteSameOrigin(u);
    if(nUrl){if(typeof input==='string')input=nUrl;else if(input instanceof Request)input=new Request(nUrl,input)}
  }catch(e){}
  return _fetch.call(this,input,init);
};
/* XHR 인터셉터 */
var _xo=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(m,url){
  if(typeof url==='string'){try{var u=new URL(url,location.href);
    if(u.origin!==location.origin&&(u.protocol==='http:'||u.protocol==='https:'))url=location.origin+'/s/'+u.host+u.pathname+u.search;
    else{var rw=__rewriteSameOrigin(u);if(rw)url=rw}
  }catch(e){}}
  return _xo.apply(this,[m,url].concat(Array.prototype.slice.call(arguments,2)));
};
})()</script>`;
}

function buildBannerScript() {
  return `<script>(function(){
if(window.__lkiBannerDone)return;window.__lkiBannerDone=true;
function rawFetch(u,cb){var x=new XMLHttpRequest;x.open('GET',u);x.onload=function(){cb(x.responseText)};x.onerror=function(){};x.send()}
rawFetch('/banners.json',function(txt){
  try{var bs=JSON.parse(txt)}catch(e){return}
  if(!bs||!bs.length)return;
  var idx=0,used=0,maxReplace=bs.length;
  function nextBanner(){if(used>=maxReplace)return null;var b=bs[idx%bs.length];idx++;used++;return b}
  function inHeader(el){var p=el;while(p){if(p.tagName==='HEADER'||p.tagName==='NAV'||(p.id&&/^(header|nav|logo|gnb)/i.test(p.id))||(p.className&&typeof p.className==='string'&&/\\b(header|nav|logo|gnb)\\b/i.test(p.className)))return true;p=p.parentElement}return false}
  function isBannerImg(img){
    if(img.src&&img.src.indexOf('/banners/')>-1)return false;
    if(inHeader(img))return false;
    var w=img.offsetWidth||img.naturalWidth,h=img.offsetHeight||img.naturalHeight;
    if(!w||!h||w<200||h<30)return false;
    var ratio=w/h;
    if(ratio>=2&&h<300)return true;
    var a=img.closest('a');
    if(a&&a.href){try{var u=new URL(a.href,location.href);if(u.origin!==location.origin&&w>=200&&ratio>=1.5&&h<300)return true}catch(e){}}
    return false;
  }
  function replaceImg(img){
    var b=nextBanner();
    if(!b){var h=img.closest('a')||img;h.style.setProperty('display','none','important');return false}
    var a=img.closest('a');
    img.src=b.image;
    img.srcset='';
    img.alt=b.alt||'';
    img.style.objectFit='cover';
    img.removeAttribute('data-src');
    img.removeAttribute('loading');
    if(a){a.href=b.url;a.target='_blank';a.rel='noopener noreferrer';a.onclick=null}
    return true;
  }
  function replaceIframe(ifr){
    var b=nextBanner();
    if(!b){ifr.style.setProperty('display','none','important');return false}
    var a=document.createElement('a');
    a.href=b.url;a.target='_blank';a.rel='noopener noreferrer';
    a.style.cssText='display:block;width:'+ifr.offsetWidth+'px;max-width:100%;height:'+ifr.offsetHeight+'px;';
    var im=document.createElement('img');
    im.src=b.image;im.alt=b.alt||'';
    im.style.cssText='width:100%;height:100%;display:block;object-fit:cover;border-radius:4px;';
    a.appendChild(im);
    ifr.parentNode.replaceChild(a,ifr);
    return true;
  }
  function scan(){
    document.querySelectorAll('img:not([data-lki])').forEach(function(img){
      if(isBannerImg(img)){img.setAttribute('data-lki','1');replaceImg(img)}
    });
    document.querySelectorAll('iframe:not([data-lki])').forEach(function(ifr){
      var s=ifr.src||'';
      if(/ad|banner|popup|click|track|sponsor|doubleclick|googlesyndication/i.test(s)){
        ifr.setAttribute('data-lki','1');replaceIframe(ifr);
      }
    });
  }
  setTimeout(scan,800);
  setTimeout(scan,2000);
  setTimeout(scan,4000);
  setTimeout(scan,7000);
  new MutationObserver(function(){setTimeout(scan,500)}).observe(document.documentElement,{childList:true,subtree:true});
});
})()</script>`;
}

function injectIntoHtml(html, realOrigin, hostname, pathDir) {
  pathDir = pathDir || '/';
  const baseTag = `<base href="/s/${hostname}${pathDir}">`;
  const script = buildInjectedScript(realOrigin);
  const bannerScript = buildBannerScript();
  html = html.replace(/<script[^>]*src=['"][^'"]*disabledev[^'"]*['"][^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*src=['"][^'"]*disable-devtool[^'"]*['"][^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*disable-devtool-auto[^>]*><\/script>/gi, '');
  html = html.replace(/window\.location\.href\s*=\s*["'][^"']*error[^"']*["']/gi, '/*noop*/');
  html = html.replace(/((?:src|href|action|poster)\s*=\s*["'])\/(?!\/|s\/)/gi, `$1/s/${hostname}/`);
  html = html.replace(/(url\s*\(\s*['"]?)\/(?!\/|s\/)/gi, `$1/s/${hostname}/`);
  if (html.includes('<head>')) {
    html = html.replace('<head>', '<head>' + baseTag);
  } else if (html.includes('<HEAD>')) {
    html = html.replace('<HEAD>', '<HEAD>' + baseTag);
  } else {
    html = baseTag + html;
  }
  if (html.includes('</body>')) {
    html = html.replace('</body>', script + bannerScript + '</body>');
  } else if (html.includes('</BODY>')) {
    html = html.replace('</BODY>', script + bannerScript + '</BODY>');
  } else {
    html += script + bannerScript;
  }
  return html;
}

function bannerApi() {
  const pubDir = resolve('public');
  const bDir = join(pubDir, 'banners');
  const bJson = join(pubDir, 'banners.json');

  function ensure() {
    if (!existsSync(bDir)) mkdirSync(bDir, { recursive: true });
    if (!existsSync(bJson)) writeFileSync(bJson, '[]');
  }
  function load() { ensure(); return JSON.parse(readFileSync(bJson, 'utf-8')); }
  function save(d) { writeFileSync(bJson, JSON.stringify(d, null, 2)); }
  function body(req) {
    return new Promise(r => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => r(Buffer.concat(c).toString())); });
  }

  return {
    name: 'banner-api',
    configureServer(server) {
      server.middlewares.use('/api/banners/list', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(load()));
      });

      server.middlewares.use('/api/banners/add', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
        const d = JSON.parse(await body(req));
        const banners = load();
        const id = 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        const ext = d.ext || 'png';
        const fname = id + '.' + ext;
        writeFileSync(join(bDir, fname), Buffer.from(d.image, 'base64'));
        banners.push({ id, image: '/banners/' + fname, url: d.url || '#', alt: d.alt || '', label: d.label || '', width: d.width || 0, height: d.height || 0 });
        save(banners);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, id }));
      });

      server.middlewares.use('/api/banners/delete', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
        const d = JSON.parse(await body(req));
        let banners = load();
        const t = banners.find(b => b.id === d.id);
        if (t) {
          const p = join(pubDir, t.image);
          if (existsSync(p)) unlinkSync(p);
          banners = banners.filter(b => b.id !== d.id);
          save(banners);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      });

      server.middlewares.use('/api/banners/reorder', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
        const d = JSON.parse(await body(req));
        const banners = load();
        const m = new Map(banners.map(b => [b.id, b]));
        save(d.ids.map(id => m.get(id)).filter(Boolean));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      });

      server.middlewares.use('/api/banners/update', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
        const d = JSON.parse(await body(req));
        const banners = load();
        const t = banners.find(b => b.id === d.id);
        if (t) {
          if (d.url !== undefined) t.url = d.url;
          if (d.alt !== undefined) t.alt = d.alt;
          if (d.label !== undefined) t.label = d.label;
          save(banners);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      });
    },
  };
}

function frameProxy() {
  return {
    name: 'frame-proxy',
    configureServer(server) {
      // /proxy?url=... — 메인 페이지 프록시 (HTML 인젝션 포함)
      server.middlewares.use('/proxy', async (req, res) => {
        const params = new URL(req.url, 'http://localhost').searchParams;
        const target = params.get('url');
        if (!target) { res.writeHead(400); res.end('Missing url param'); return; }

        try {
          const ref = params.get('ref');
          const resp = await proxyFetch(target, ref || undefined);
          const ct = resp.headers.get('content-type') || 'text/html';
          res.setHeader('Content-Type', ct);
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (ct.includes('text/html')) {
            let html = await resp.text();
            const u = new URL(target);
            const pathDir = u.pathname.substring(0, u.pathname.lastIndexOf('/') + 1) || '/';
            html = injectIntoHtml(html, u.origin, u.hostname, pathDir);
            res.writeHead(200);
            res.end(html);
          } else {
            res.writeHead(200);
            const buf = Buffer.from(await resp.arrayBuffer());
            res.end(buf);
          }
        } catch (e) {
          res.writeHead(502);
          res.end('Proxy error: ' + e.message);
        }
      });

      // /s/HOSTNAME/path — 서브리소스 프록시 (CSS, JS, 이미지, 비디오 스트림 등)
      server.middlewares.use('/s', async (req, res) => {
        const match = req.url.match(/^\/([^\/]+)(\/.*)?$/);
        if (!match) { res.writeHead(400); res.end('Bad path'); return; }
        const host = match[1];
        const path = match[2] || '/';
        const target = 'https://' + host + path;

        try {
          let reqBody;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            reqBody = await new Promise((resolve) => {
              const chunks = []; req.on('data', c => chunks.push(c)); req.on('end', () => resolve(Buffer.concat(chunks)));
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
            res.writeHead(200);
            res.end(html);
          } else {
            res.writeHead(200);
            const buf = Buffer.from(await resp.arrayBuffer());
            res.end(buf);
          }
        } catch (e) {
          res.writeHead(502);
          res.end('Proxy error: ' + e.message);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), bannerApi(), frameProxy()],
})
