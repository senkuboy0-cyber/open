const { spawn, execSync } = require('child_process');

console.log("[BOT] OpenClaw Auto-Pairing Started");

const gatewayEnv = {
  ...process.env,
  OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || 'admin1234'
};

const claw = spawn('openclaw', [
  'gateway', '--allow-unconfigured', '--bind', 'lan', '--port', '10000'
], { env: gatewayEnv });

// Gateway ready হলে auto-approve চালাও
let approved = false;
function tryApprove() {
  if (approved) return;
  try {
    console.log('[BOT] Checking for pending devices...');
    execSync(
      'openclaw devices approve --latest',
      { env: gatewayEnv, stdio: 'inherit' }
    );
    approved = true;
    console.log('[BOT] ✅ Device approved! Refresh browser.');
  } catch (e) {
    // এখনো কেউ connect করেনি, পরে আবার চেষ্টা করবো
  }
}

// প্রতি ৫ সেকেন্ডে check করো
setInterval(tryApprove, 5000);

claw.stdout.on('data', d => process.stdout.write(d));
claw.stderr.on('data', d => process.stderr.write(d));
claw.on('exit', code => process.exit(code));