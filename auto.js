const { spawn, execSync } = require('child_process');

console.log("[BOT] OpenClaw Auto-Pairing Started");

const claw = spawn('openclaw', [
  'gateway', '--allow-unconfigured', '--bind', 'lan', '--port', '10000'
]);

function handleLog(data) {
  const log = data.toString();
  process.stdout.write(log);

  const match = log.match(/requestId[:\s]+([a-f0-9-]{36})/i);
  if (match && match[1]) {
    const reqId = match[1];
    console.log(`\n[BOT] Pairing ID found: ${reqId}`);
    
    setTimeout(() => {
      try {
        execSync(`openclaw device-pair accept ${reqId}`, { stdio: 'inherit' });
        console.log('[BOT] ✅ Pairing accepted!');
      } catch (e) {
        try {
          execSync(`openclaw pair accept ${reqId}`, { stdio: 'inherit' });
          console.log('[BOT] ✅ Pairing accepted (alt command)!');
        } catch (e2) {
          console.log('[BOT] ❌ Both commands failed:', e2.message);
        }
      }
    }, 1000);
  }
}

// stderr এবং stdout দুটোই দেখো
claw.stdout.on('data', handleLog);
claw.stderr.on('data', handleLog);

claw.on('exit', (code) => {
  console.log(`[BOT] Gateway exited with code ${code}`);
  process.exit(code);
});