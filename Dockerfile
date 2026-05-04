# Base image: Highly optimized Alpine Linux for Render
FROM node:24-alpine

# Memory constraints for Render's 512MB free tier
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Install OpenClaw globally
RUN npm install -g openclaw@latest --omit=dev

# --- THE MASTER FIX ---
# Create OpenClaw's default directory and force our config directly into it
RUN mkdir -p /root/.openclaw
COPY openclaw.json /root/.openclaw/config.json

# Expose Render's preferred default web port
EXPOSE 10000

# Start gateway and strictly lock the bind address to 0.0.0.0 via CLI flags
CMD ["openclaw", "gateway", "--bind", "0.0.0.0", "--port", "10000"]