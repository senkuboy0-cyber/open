# Base image: Highly optimized Alpine Linux for Render's constrained environment
FROM node:24-alpine

# Memory constraints for Render's 512MB free/starter tier to prevent OOM errors
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Copy the professional gateway configuration file into the container
COPY openclaw.json /app/openclaw.json

# Install OpenClaw globally (production only, omitting dev dependencies)
RUN npm install -g openclaw@latest --omit=dev

# Force OpenClaw to utilize our specific proxy-bypassing configuration
ENV OPENCLAW_CONFIG_FILE="/app/openclaw.json"

# Expose Render's preferred default web port
EXPOSE 10000

# Execute the gateway application securely
CMD ["openclaw", "gateway"]