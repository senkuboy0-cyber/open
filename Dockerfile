# Base image: Highly optimized Alpine Linux for Render
FROM node:24-alpine

# Memory constraints for Render's 512MB free tier
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Copy the configuration file
COPY openclaw.json /app/openclaw.json

# Install OpenClaw globally
RUN npm install -g openclaw@latest --omit=dev

# Force OpenClaw to utilize our configuration file
ENV OPENCLAW_CONFIG_FILE="/app/openclaw.json"

# Expose Render's preferred default web port
EXPOSE 10000

# Start gateway bypassing the interactive setup prompt
CMD ["openclaw", "gateway", "--allow-unconfigured"]