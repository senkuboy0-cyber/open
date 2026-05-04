const { spawn, exec } = require('child_process');

console.log("==========================================");
console.log("[SUPER-BOT V3] Ultimate Bypass Engaged");
console.log("==========================================");

// Start OpenClaw Gateway
const claw = spawn('openclaw', ['gateway', '--allow-unconfigured', '--bind', 'lan', '--port', '10000']);

const handleLog = (data) => {
    const log = data.toString();
    process.stdout.write(log);

    // Strategy 1: Real-time Interception via Regex
    const match = log.match(/requestId:\s*([a-f0-9\-]+)/i);
    if (match && match[1]) {
        acceptPair(match[1]);
    }
};

const acceptPair = (id) => {
    console.log(`\n[SUPER-BOT] 🎯 Intercepted Request: ${id}`);
    exec(`openclaw pair accept ${id}`, (err) => {
        if (!err) console.log(`[SUPER-BOT] ✅ Successfully Bypassed! Refresh now.`);
    });
};

// Listen to both streams
claw.stdout.on('data', handleLog);
claw.stderr.on('data', handleLog);

// Strategy 2: Brute-Force Scanning (Every 5 seconds)
// This will try to accept any pending request even if the log fails
setInterval(() => {
    exec('openclaw pair list', (err, stdout) => {
        if (!err && stdout.includes('pending')) {
            const pendingIds = stdout.match(/[a-f0-9\-]{36}/g);
            if (pendingIds) {
                pendingIds.forEach(id => {
                    console.log(`[SUPER-BOT] 🛡️  Found pending request in list: ${id}`);
                    acceptPair(id);
                });
            }
        }
    });
}, 5000);