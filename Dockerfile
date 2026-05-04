# Base image: Highly optimized Alpine Linux for Render
FROM node:24-alpine

# Memory constraints for Render's 512MB free tier
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Install OpenClaw globally omitting development dependencies
RUN npm install -g openclaw@latest --omit=dev

# Create the exact directory OpenClaw expects and copy config
RUN mkdir -p /root/.openclaw
COPY openclaw.json /root/.openclaw/openclaw.json
RUN chmod 444 /root/.openclaw/openclaw.json

# Copy our powerful Node.js auto-pairing bot
COPY auto.js /app/auto.js

# Expose Render's preferred default web port
EXPOSE 10000

# Start the gateway through the Super-Bot wrapper
CMD ["node", "auto.js"]