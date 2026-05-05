const fs = require('fs');

const DEVICES_DIR = '/root/.openclaw/devices';
const PENDING = `${DEVICES_DIR}/pending.json`;
const APPROVED = `${DEVICES_DIR}/approved.json`;

// folder না থাকলে বানাও
fs.mkdirSync(DEVICES_DIR, { recursive: true });

function autoApprove() {
  try {
    if (!fs.existsSync(PENDING)) return;
    const pending = JSON.parse(fs.readFileSync(PENDING, 'utf8'));
    if (Object.keys(pending).length === 0) return;

    let approved = {};
    if (fs.existsSync(APPROVED)) {
      approved = JSON.parse(fs.readFileSync(APPROVED, 'utf8'));
    }

    // pending সব entry approved এ যোগ করো
    Object.assign(approved, pending);
    fs.writeFileSync(APPROVED, JSON.stringify(approved, null, 2));
    fs.writeFileSync(PENDING, '{}');
    console.log('[BOT] ✅ Auto-approved device! Refresh browser.');
  } catch (e) {
    console.log('[BOT] Watch error:', e.message);
  }
}

// pending.json এ নতুন কিছু আসলে approve করো
fs.watch(DEVICES_DIR, () => {
  setTimeout(autoApprove, 500);
});

// প্রতি ২ সেকেন্ডেও check করো
setInterval(autoApprove, 2000);