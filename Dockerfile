# Base image: Highly optimized Alpine Linux for Render
FROM node:24-alpine

# Memory constraints for Render's 512MB free tier
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Install OpenClaw globally omitting development dependencies
RUN npm install -g openclaw@latest --omit=dev

# Create the exact directory OpenClaw expects and lock config
RUN mkdir -p /root/.openclaw
COPY openclaw.json /root/.openclaw/openclaw.json
RUN chmod 444 /root/.openclaw/openclaw.json

# Copy our Auto-Pairing Bot script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose Render's preferred default web port
EXPOSE 10000

# Start gateway through the auto-pairing bot
CMD ["/app/start.sh"]