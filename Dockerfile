# Base image: Highly optimized Alpine Linux for Render's constrained environment
FROM node:24-alpine

# Memory constraints for Render's 512MB free/starter tier to prevent OOM crashes
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Install OpenClaw globally omitting development dependencies
RUN npm install -g openclaw@latest --omit=dev

# --- THE MASTER FIX (Updated with correct bind preset) ---
# Create OpenClaw's default directory and explicitly inject our configuration file
RUN mkdir -p /root/.openclaw
COPY openclaw.json /root/.openclaw/config.json

# Expose Render's preferred default web port
EXPOSE 10000

# Start gateway securely using the 'lan' preset to permit Render's external routing
CMD ["openclaw", "gateway", "--bind", "lan", "--port", "10000"]