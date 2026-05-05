# Base image: Highly optimized Alpine Linux for Render
FROM node:24-alpine

# Memory constraints for Render's 512MB free tier
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Copy package.json first for better caching
COPY package.json /app/package.json

# Install dependencies
RUN cd /app && npm install

# Install OpenClaw globally omitting development dependencies
RUN npm install -g openclaw@latest --omit=dev

# Create the exact directory OpenClaw expects and copy config
RUN mkdir -p /root/.openclaw
COPY openclaw.json /root/.openclaw/openclaw.json
RUN chmod 444 /root/.openclaw/openclaw.json

# Copy our proxy bot
COPY auto.js /app/auto.js

# Expose Render's preferred default web port
EXPOSE 10000

# Start the proxy server
CMD ["node", "auto.js"]