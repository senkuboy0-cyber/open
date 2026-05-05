const { spawn, exec } = require('child_process');
const http = require('http');
const httpProxy = require('http-proxy');

const TOKEN = 'admin1234';
const RENDER_PORT = 10000;
const CLAW_PORT = 10001;

// OpenClaw চালাও port 10001 এ
const claw = spawn('openclaw', [
  'gateway', '--allow-unconfigured', '--bind', 'lan', '--port', String(CLAW_PORT)
]);
claw.stdout.on('data', d => process.stdout.write(d));
claw.stderr.on('data', d => process.stderr.write(d));

// Proxy বানাও
const proxy = httpProxy.createProxyServer({ target: `http://127.0.0.1:${CLAW_PORT}`, ws: true });

const server = http.createServer((req, res) => {
  // Terminal UI
  if (req.url === '/terminal') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html><html><body style="background:#000;color:#0f0;font-family:monospace">
      <h3 style="color:#0f0">🖥️ OpenClaw Terminal</h3>
      <input id="cmd" style="width:80%;background:#111;color:#0f0;border:1px solid #0f0;padding:5px" placeholder="command এখানে লেখো...">
      <button onclick="run()" style="background:#0f0;color:#000;padding:5px 10px">Run</button>
      <pre id="out" style="background:#111;padding:10px;min-height:200px;white-space:pre-wrap"></pre>
      <script>
        async function run() {
          const cmd = document.getElementById('cmd').value;
          const r = await fetch('/run?cmd=' + encodeURIComponent(cmd));
          const t = await r.text();
          document.getElementById('out').textContent = t;
        }
        document.getElementById('cmd').addEventListener('keydown', e => e.key === 'Enter' && run());
      </script>
    </body></html>`);
    return;
  }

  // Command runner
  if (req.url.startsWith('/run?')) {
    const cmd = decodeURIComponent(req.url.split('?cmd=')[1] || '');
    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(stdout || stderr || err?.message || 'done');
    });
    return;
  }

  // বাকি সব OpenClaw এ forward করো
  proxy.web(req, res);
});

// WebSocket ও forward করো
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(RENDER_PORT, () => {
  console.log(`[BOT] Proxy running on ${RENDER_PORT}`);
});