# Base image: Highly optimized Alpine Linux for Render
FROM node:24-alpine

# Memory constraints for Render's 512MB free tier
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Install OpenClaw globally omitting development dependencies
RUN npm install -g openclaw@latest --omit=dev

# --- THE LOCKDOWN FIX ---
# Create the exact directory OpenClaw expects
RUN mkdir -p /root/.openclaw

# Copy the config to the EXACT filename OpenClaw looks for
COPY openclaw.json /root/.openclaw/openclaw.json

# Lock the file down (Read-Only) so OpenClaw CANNOT overwrite the token or origin rules
RUN chmod 444 /root/.openclaw/openclaw.json

# Expose Render's preferred default web port
EXPOSE 10000

# Start gateway securely using the 'lan' preset to permit Render's external routing
CMD ["openclaw", "gateway", "--allow-unconfigured", "--bind", "lan", "--port", "10000"]