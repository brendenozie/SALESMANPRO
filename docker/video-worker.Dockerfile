# docker/video-worker.Dockerfile
# Lightweight, crash-isolated Alpine container with FFmpeg for SalesmanPro
FROM node:20-alpine AS base

# Install system FFmpeg and dependencies
RUN apk add --no-cache ffmpeg bash ca-certificates

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --omit=dev && npx prisma generate

# Copy application source
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV MEDIA_TRANSCODE_CONCURRENCY=1

# Run the standalone transcode runner
CMD ["npx", "ts-node", "--transpile-only", "workers/video-transcode-runner.ts"]
