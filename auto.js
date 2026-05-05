const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const httpProxy = require('http-proxy');

const TOKEN = 'admin1234';
const RENDER_PORT = 10000;
const CLAW_PORT = 10001;
const DEVICES_DIR = '/root/.openclaw/devices';
const PENDING = `${DEVICES_DIR}/pending.json`;
const APPROVED = `${DEVICES_DIR}/approved.json`;

// Proxy বানাও
const proxy = httpProxy.createProxyServer({
  target: `http://127.0.0.1:${CLAW_PORT}`,
  ws: true
});
proxy.on('error', (err, req, res) => {
  if (res?.writeHead) {
    res.writeHead(502);
    res.end('Gateway starting, please wait 30s and refresh...');
  }
});

// HTTP Server (আগে চালু করো)
const server = http.createServer((req, res) => {
  if (req.url === '/terminal') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html><html><body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
      <h3>OpenClaw Terminal</h3>
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <input id="cmd" style="flex:1;background:#111;color:#0f0;border:1px solid #0f0;padding:8px;font-family:monospace" placeholder="command লেখো...">
        <button onclick="run()" style="background:#0f0;color:#000;padding:8px 16px;border:none;cursor:pointer;font-weight:bold">Run</button>
      </div>
      <pre id="out" style="background:#111;padding:15px;min-height:200px;white-space:pre-wrap;border:1px solid #333;overflow:auto;max-height:400px"></pre>
      <script>
        async function run() {
          const cmd = document.getElementById('cmd').value;
          if (!cmd) return;
          document.getElementById('out').textContent = 'Running...';
          try {
            const r = await fetch('/run?cmd=' + encodeURIComponent(cmd));
            document.getElementById('out').textContent = await r.text();
          } catch(e) {
            document.getElementById('out').textContent = 'Error: ' + e.message;
          }
        }
        document.getElementById('cmd').addEventListener('keydown', e => e.key === 'Enter' && run());
      </script>
    </body></html>`);
    return;
  }

  if (req.url.startsWith('/run?')) {
    const cmd = decodeURIComponent(req.url.split('?cmd=')[1] || '');
    if (!cmd) { res.writeHead(400); res.end('no command'); return; }
    exec(cmd, { timeout: 15000 }, (err, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end((stdout || '') + (stderr || '') + (err ? '\nExit: ' + err.message : ''));
    });
    return;
  }

  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, e => e && socket.destroy());
});

server.listen(RENDER_PORT, () => {
  console.log(`[BOT] Server on port ${RENDER_PORT}`);
  console.log(`[BOT] Terminal: /terminal`);
});

// Gateway restart function
let clawProcess = null;

function startGateway() {
  console.log('[BOT] Starting gateway...');
  clawProcess = spawn('openclaw', [
    'gateway', '--allow-unconfigured', '--bind', 'lan', '--port', String(CLAW_PORT)
  ]);
  clawProcess.stdout.on('data', d => process.stdout.write(d));
  clawProcess.stderr.on('data', d => process.stderr.write(d));
  clawProcess.on('exit', code => {
    console.log(`[BOT] Gateway exited (${code}), restarting in 3s...`);
    setTimeout(startGateway, 3000);
  });
}

startGateway();

// Auto-approve
fs.mkdirSync(DEVICES_DIR, { recursive: true });

function autoApprove() {
  try {
    if (!fs.existsSync(PENDING)) return;
    const pendingRaw = fs.readFileSync(PENDING, 'utf8');
    const pending = JSON.parse(pendingRaw);
    if (Object.keys(pending).length === 0) return;

    let approved = {};
    if (fs.existsSync(APPROVED)) {
      approved = JSON.parse(fs.readFileSync(APPROVED, 'utf8'));
    }

    Object.assign(approved, pending);
    fs.writeFileSync(APPROVED, JSON.stringify(approved, null, 2));
    fs.writeFileSync(PENDING, '{}');
    console.log('[BOT] ✅ Device approved! Restarting gateway...');

    // Gateway restart করো যাতে approved.json পড়ে
    if (clawProcess) clawProcess.kill();

  } catch (e) {
    console.log('[BOT] AutoApprove error:', e.message);
  }
}

// Watch + interval দুটোই
setTimeout(() => {
  try {
    fs.watch(DEVICES_DIR, () => setTimeout(autoApprove, 500));
  } catch (e) {}
}, 10000);

setInterval(autoApprove, 2000);