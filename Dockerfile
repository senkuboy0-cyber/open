# Base image: Highly optimized Alpine Linux for Render
FROM node:24-alpine

# Memory constraints for Render's 512MB free tier
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Copy the configuration file into the container
COPY openclaw.json /app/openclaw.json

# Install OpenClaw globally omitting development dependencies
RUN npm install -g openclaw@latest --omit=dev

# Explicitly tell OpenClaw where our custom configuration file is located
ENV OPENCLAW_CONFIG_FILE="/app/openclaw.json"

# Expose Render's preferred default web port
EXPOSE 10000

# Start gateway bypassing the interactive setup prompt and binding to external proxy
CMD ["openclaw", "gateway", "--allow-unconfigured", "--bind", "lan", "--port", "10000"]