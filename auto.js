const { spawn, execSync } = require('child_process');

console.log("[BOT] OpenClaw Auto-Pairing Started");

const TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || 'admin1234';
const PORT = process.env.OPENCLAW_GATEWAY_PORT || '10000';
const GATEWAY_URL = `ws://127.0.0.1:${PORT}`;

const claw = spawn('openclaw', [
  'gateway', '--allow-unconfigured', '--bind', 'lan', '--port', PORT
], { env: { ...process.env } });

let gatewayReady = false;

function tryApprove() {
  if (!gatewayReady) return;
  try {
    console.log('[BOT] Checking for pending devices...');
    execSync(
      `openclaw devices approve --latest --url ${GATEWAY_URL} --token ${TOKEN}`,
      { stdio: 'inherit' }
    );
    console.log('[BOT] ✅ Device approved! Refresh browser.');
  } catch (e) {
    // কেউ connect করেনি এখনো
  }
}

// প্রতি ৩ সেকেন্ডে check
setInterval(tryApprove, 3000);

function handleLog(data) {
  const log = data.toString();
  process.stdout.write(log);
  if (log.includes('[gateway] ready')) {
    gatewayReady = true;
    console.log('[BOT] Gateway is ready, starting approval loop...');
  }
}

claw.stdout.on('data', handleLog);
claw.stderr.on('data', handleLog);
claw.on('exit', code => process.exit(code));