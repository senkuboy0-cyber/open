const { spawn } = require('child_process');

const TOKEN = 'admin1234';
const PORT = '10000';
const BASE = `http://127.0.0.1:${PORT}`;
const HEADERS = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

console.log("[BOT] Started");

const claw = spawn('openclaw', ['gateway', '--allow-unconfigured', '--bind', 'lan', '--port', PORT]);

let gatewayReady = false;

async function tryApprove() {
  if (!gatewayReady) return;
  try {
    // Pending device list আনো
    const res = await fetch(`${BASE}/api/v1/devices/pending`, { headers: HEADERS });
    const data = await res.json();
    const pending = data?.devices || data?.pending || [];
    
    for (const device of pending) {
      const id = device.id || device.requestId || device.deviceId;
      if (!id) continue;
      console.log(`[BOT] Approving device: ${id}`);
      await fetch(`${BASE}/api/v1/devices/${id}/approve`, {
        method: 'POST', headers: HEADERS
      });
      console.log('[BOT] ✅ Approved! Refresh browser.');
    }
  } catch (e) {
    // silent
  }
}

setInterval(tryApprove, 3000);

function handleLog(data) {
  const log = data.toString();
  process.stdout.write(log);
  if (log.includes('[gateway] ready')) {
    gatewayReady = true;
    console.log('[BOT] Gateway ready, polling...');
  }
}

claw.stdout.on('data', handleLog);
claw.stderr.on('data', handleLog);
claw.on('exit', code => process.exit(code));