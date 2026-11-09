const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const PUB = path.join(__dirname, 'public');
const B_DIR = path.join(PUB, 'banners');
const B_JSON = path.join(PUB, 'banners.json');

if (!fs.existsSync(B_DIR)) fs.mkdirSync(B_DIR, { recursive: true });
if (!fs.existsSync(B_JSON)) fs.writeFileSync(B_JSON, '[]');

function load() { return JSON.parse(fs.readFileSync(B_JSON, 'utf-8')); }
function save(d) { fs.writeFileSync(B_JSON, JSON.stringify(d, null, 2)); }
function readBody(req) {
  return new Promise(r => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => r(Buffer.concat(c).toString())); });
}

const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.gif':'image/gif', '.webp':'image/webp', '.svg':'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // API
  if (url.pathname === '/api/banners/list') {
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify(load()));
  }
  if (url.pathname === '/api/banners/add' && req.method === 'POST') {
    const d = JSON.parse(await readBody(req));
    const banners = load();
    const id = 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const ext = d.ext || 'png';
    const fname = id + '.' + ext;
    fs.writeFileSync(path.join(B_DIR, fname), Buffer.from(d.image, 'base64'));
    banners.push({ id, image: '/banners/' + fname, url: d.url || '#', alt: d.alt || '', label: d.label || '', width: d.width || 0, height: d.height || 0 });
    save(banners);
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ ok: true, id }));
  }
  if (url.pathname === '/api/banners/delete' && req.method === 'POST') {
    const d = JSON.parse(await readBody(req));
    let banners = load();
    const t = banners.find(b => b.id === d.id);
    if (t) { const p = path.join(PUB, t.image); if (fs.existsSync(p)) fs.unlinkSync(p); banners = banners.filter(b => b.id !== d.id); save(banners); }
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ ok: true }));
  }
  if (url.pathname === '/api/banners/reorder' && req.method === 'POST') {
    const d = JSON.parse(await readBody(req));
    const banners = load();
    const m = new Map(banners.map(b => [b.id, b]));
    save(d.ids.map(id => m.get(id)).filter(Boolean));
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ ok: true }));
  }
  if (url.pathname === '/api/banners/update' && req.method === 'POST') {
    const d = JSON.parse(await readBody(req));
    const banners = load();
    const t = banners.find(b => b.id === d.id);
    if (t) { if (d.url !== undefined) t.url = d.url; if (d.alt !== undefined) t.alt = d.alt; if (d.label !== undefined) t.label = d.label; save(banners); }
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ ok: true }));
  }

  // Static files
  let filePath = url.pathname === '/' ? '/admin.html' : url.pathname;
  const full = path.join(PUB, filePath);
  if (!full.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    const ext = path.extname(full);
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    return res.end(fs.readFileSync(full));
  }
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log('배너 관리: http://localhost:' + PORT);
  const { exec } = require('child_process');
  exec('start http://localhost:' + PORT);
});
