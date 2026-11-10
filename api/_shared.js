const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export async function proxyFetch(target, referer, opts) {
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

export function buildInjectedScript(realOrigin) {
  return `<script>(function(){
var S=new WeakSet;function isPlayer(el){return el.tagName==="VIDEO"||el.classList.contains("art-video-player")||el.id==="video-container"||!!el.querySelector("video")||!!el.closest(".art-video-player")||!!el.closest("#video-container")}
function k(){document.querySelectorAll("*").forEach(function(el){if(S.has(el))return;var cs=getComputedStyle(el);if(cs.position!=="fixed"&&cs.position!=="absolute")return;var z=parseInt(cs.zIndex||0);if(z<10)return;var w=el.offsetWidth,h=el.offsetHeight;if(w<window.innerWidth*0.25||h<window.innerHeight*0.25)return;if(isPlayer(el))return;S.add(el);el.style.setProperty("display","none","important")})}
[500,1500,3000,5000].forEach(function(ms){setTimeout(k,ms)});
new MutationObserver(function(){setTimeout(k,200)}).observe(document.documentElement,{childList:true,subtree:true});
var __ref='${realOrigin}';
var __host=(function(){try{return new URL(__ref).hostname}catch(e){return ''}})();
function __rewriteSameOrigin(u){if(u.origin===location.origin&&__host&&!u.pathname.startsWith('/proxy')&&!u.pathname.startsWith('/s/')&&!u.pathname.startsWith('/src/')&&!u.pathname.startsWith('/@')&&!u.pathname.startsWith('/node_modules/')&&!u.pathname.startsWith('/banners')&&u.pathname!=='/banners.json'&&u.pathname!=='/'){return location.origin+'/s/'+__host+u.pathname+u.search}return null}
function toProxy(url){
  try{var u=new URL(url,location.href);if(u.origin===location.origin&&(u.pathname.startsWith('/proxy')||u.pathname.startsWith('/s/')))return null;if(u.protocol==='http:'||u.protocol==='https:'){var p=location.origin+'/proxy?url='+encodeURIComponent(u.href);if(__ref)p+='&ref='+encodeURIComponent(__ref);return p}}catch(e){}
  return null;
}
document.addEventListener('click',function(e){
  var a=e.target.closest('a');if(!a||!a.href)return;
  var p=toProxy(a.href);if(p){e.preventDefault();e.stopPropagation();location.href=p}
},true);
document.addEventListener('submit',function(e){
  var f=e.target;if(!f||!f.action)return;var p=toProxy(f.action);if(p){f.action=p}
},true);
var _open=window.open;window.open=function(url){
  var p=toProxy(url);return _open.call(window,p||url,arguments[1],arguments[2]);
};
var _oSA=Element.prototype.setAttribute;
Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='IFRAME'&&typeof v==='string'){var p=toProxy(v);if(p)return _oSA.call(this,n,p)}return _oSA.call(this,n,v)};
try{var _sd=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'src');if(_sd&&_sd.set){Object.defineProperty(HTMLIFrameElement.prototype,'src',{get:_sd.get,set:function(v){if(typeof v==='string'){var p=toProxy(v);if(p){_sd.set.call(this,p);return}}_sd.set.call(this,v)},configurable:true,enumerable:true})}}catch(e){}
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
  var idx=0;
  function nextBanner(){var b=bs[idx%bs.length];idx++;return b}
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
    var a=img.closest('a');
    img.src=b.image;
    img.srcset='';
    img.alt=b.alt||'';
    img.style.objectFit='cover';
    img.removeAttribute('data-src');
    img.removeAttribute('loading');
    if(a){a.href=b.url;a.target='_blank';a.rel='noopener noreferrer';a.onclick=null}
  }
  function replaceIframe(ifr){
    var b=nextBanner();
    var a=document.createElement('a');
    a.href=b.url;a.target='_blank';a.rel='noopener noreferrer';
    a.style.cssText='display:block;width:'+ifr.offsetWidth+'px;max-width:100%;height:'+ifr.offsetHeight+'px;';
    var im=document.createElement('img');
    im.src=b.image;im.alt=b.alt||'';
    im.style.cssText='width:100%;height:100%;display:block;object-fit:cover;border-radius:4px;';
    a.appendChild(im);
    ifr.parentNode.replaceChild(a,ifr);
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

export function injectIntoHtml(html, realOrigin, hostname, pathDir) {
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
