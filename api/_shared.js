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
function __rewriteSameOrigin(u){if(u.origin===location.origin&&__host&&!u.pathname.startsWith('/proxy')&&!u.pathname.startsWith('/s/')&&!u.pathname.startsWith('/src/')&&!u.pathname.startsWith('/@')&&!u.pathname.startsWith('/node_modules/')&&u.pathname!=='/'){return location.origin+'/s/'+__host+u.pathname+u.search}return null}
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

export function injectIntoHtml(html, realOrigin, hostname, pathDir) {
  pathDir = pathDir || '/';
  const baseTag = `<base href="/s/${hostname}${pathDir}">`;
  const script = buildInjectedScript(realOrigin);
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
    html = html.replace('</body>', script + '</body>');
  } else if (html.includes('</BODY>')) {
    html = html.replace('</BODY>', script + '</BODY>');
  } else {
    html += script;
  }
  return html;
}
