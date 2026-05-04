const { spawn, execSync } = require('child_process');

console.log("==========================================");
console.log("[SUPER-BOT] OpenClaw Auto-Bypass Activated");
console.log("==========================================");

// Start OpenClaw Gateway
const claw = spawn('openclaw', ['gateway', '--allow-unconfigured', '--bind', 'lan', '--port', '10000']);

claw.stdout.on('data', (data) => {
    const log = data.toString();
    process.stdout.write(log); // Keep showing normal logs in Render dashboard

    // Hunt for the pairing ID using Regex
    const match = log.match(/requestId:\s*([a-f0-9\-]+)/i);
    if (match && match[1]) {
        const reqId = match[1];
        console.log(`\n[SUPER-BOT] 🔥 Device pairing intercepted! ID: ${reqId}`);
        console.log(`[SUPER-BOT] ⚡ Forcing acceptance...`);
        
        try {
            // Force the pairing acceptance instantly
            const result = execSync(`openclaw pair accept ${reqId}`);
            console.log(`[SUPER-BOT] ✅ Bypassed successfully!`);
            console.log(`[SUPER-BOT] 👉 REFRESH YOUR BROWSER NOW!`);
        } catch (err) {
            console.log(`[SUPER-BOT] ❌ Failed to bypass: ${err.message}`);
        }
    }
});

claw.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
});