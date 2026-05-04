# Base image: Highly optimized Alpine Linux for Render
FROM node:24-alpine

# Memory constraints for Render's 512MB free tier
ENV NODE_OPTIONS="--max-old-space-size=400"

# Set the root working directory
WORKDIR /app

# Install OpenClaw globally omitting development dependencies
RUN npm install -g openclaw@latest --omit=dev

# --- THE ULTIMATE OVERRIDE (Environment Variables) ---
# These strict variables CANNOT be overwritten or deleted by OpenClaw
ENV OPENCLAW_GATEWAY_AUTH_TOKEN="admin1234"
ENV OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS='["*"]'
ENV OPENCLAW_GATEWAY_CONTROLUI_DANGEROUSLYALLOWHOSTHEADERORIGINFALLBACK="true"

# Expose Render's preferred default web port
EXPOSE 10000

# Start gateway with all external routing presets
CMD ["openclaw", "gateway", "--allow-unconfigured", "--bind", "lan", "--port", "10000"]