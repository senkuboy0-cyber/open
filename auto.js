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
claw.on('exit', code => {
  console.log(`[BOT] OpenClaw exited: ${code}`);
  process.exit(code);
});

// Proxy বানাও
const proxy = httpProxy.createProxyServer({
  target: `http://127.0.0.1:${CLAW_PORT}`,
  ws: true
});

// Error হলে crash করবে না
proxy.on('error', (err, req, res) => {
  if (res && res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Gateway starting, please wait and refresh...');
  }
});

const server = http.createServer((req, res) => {
  // Terminal UI
  if (req.url === '/terminal') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html><html><body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
      <h3 style="color:#0f0">OpenClaw Terminal</h3>
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <input id="cmd" style="flex:1;background:#111;color:#0f0;border:1px solid #0f0;padding:8px;font-family:monospace" placeholder="command লেখো...">
        <button onclick="run()" style="background:#0f0;color:#000;padding:8px 16px;border:none;cursor:pointer;font-weight:bold">Run</button>
      </div>
      <pre id="out" style="background:#111;padding:15px;min-height:300px;white-space:pre-wrap;border:1px solid #333;overflow:auto"></pre>
      <script>
        async function run() {
          const cmd = document.getElementById('cmd').value;
          if (!cmd) return;
          document.getElementById('out').textContent = 'Running...';
          try {
            const r = await fetch('/run?cmd=' + encodeURIComponent(cmd));
            const t = await r.text();
            document.getElementById('out').textContent = t || '(no output)';
          } catch(e) {
            document.getElementById('out').textContent = 'Error: ' + e.message;
          }
        }
        document.getElementById('cmd').addEventListener('keydown', e => {
          if (e.key === 'Enter') run();
        });
      </script>
    </body></html>`);
    return;
  }

  // Command runner
  if (req.url.startsWith('/run?')) {
    const cmd = decodeURIComponent(req.url.split('?cmd=')[1] || '');
    if (!cmd) {
      res.writeHead(400);
      res.end('no command');
      return;
    }
    exec(cmd, { timeout: 15000 }, (err, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(stdout || stderr || err?.message || '(done)');
    });
    return;
  }

  // বাকি সব OpenClaw এ forward করো
  proxy.web(req, res);
});

// WebSocket ও forward করো
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, (err) => {
    if (err) socket.destroy();
  });
});

server.listen(RENDER_PORT, () => {
  console.log(`[BOT] Proxy server running on port ${RENDER_PORT}`);
  console.log(`[BOT] Terminal: https://openclaw-jbov.onrender.com/terminal`);
});