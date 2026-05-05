const { spawn, execSync } = require('child_process');

const TOKEN = 'admin1234';
const PORT = '10000';
const GATEWAY_URL = `ws://127.0.0.1:${PORT}`;

const approveEnv = {
  ...process.env,
  OPENCLAW_GATEWAY_TOKEN: TOKEN,
  OPENCLAW_REMOTE_URL: GATEWAY_URL,
};

console.log("[BOT] OpenClaw Auto-Pairing Started");

const claw = spawn('openclaw', [
  'gateway', '--allow-unconfigured', '--bind', 'lan', '--port', PORT
]);

let gatewayReady = false;

function tryApprove() {
  if (!gatewayReady) return;
  try {
    console.log('[BOT] Checking for pending devices...');
    const result = execSync(
      `openclaw devices approve --latest --url ${GATEWAY_URL} --token ${TOKEN}`,
      { env: approveEnv, encoding: 'utf8' }
    );
    console.log('[BOT] ✅ Approved:', result);
  } catch (e) {
    console.log('[BOT] No pending or error:', e.message.slice(0, 100));
  }
}

setInterval(tryApprove, 3000);

function handleLog(data) {
  const log = data.toString();
  process.stdout.write(log);
  if (log.includes('[gateway] ready')) {
    gatewayReady = true;
    console.log('[BOT] Gateway ready!');
  }
}

claw.stdout.on('data', handleLog);
claw.stderr.on('data', handleLog);
claw.on('exit', code => process.exit(code));