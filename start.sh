#!/bin/sh

# Create the log file
touch /app/gateway.log

# Start OpenClaw in the background and save all logs
openclaw gateway --allow-unconfigured --bind lan --port 10000 > /app/gateway.log 2>&1 &

# Show logs in Render dashboard
tail -f /app/gateway.log &

echo "[BOT] Auto-Pairing system is active and watching..."

# Loop to watch logs and auto-accept pairing requests
while true; do
  # Extract the requestId from the logs
  REQ_ID=$(grep -o "requestId: [a-f0-9\-]*" /app/gateway.log | tail -n 1 | cut -d' ' -f2)
  
  if [ -n "$REQ_ID" ]; then
    echo "======================================"
    echo "[BOT] Device pairing requested!"
    echo "[BOT] Auto-accepting ID: $REQ_ID"
    echo "======================================"
    
    # Accept the pair automatically
    openclaw pair accept "$REQ_ID"
    
    # Clear the log so it doesn't loop
    > /app/gateway.log
  fi
  
  sleep 2
done