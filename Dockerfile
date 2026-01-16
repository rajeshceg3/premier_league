# Stage 1: Build Frontend
FROM node:18-alpine AS client-build
WORKDIR /usr/src/app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Environment
FROM node:18-alpine
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install only production dependencies (Backend)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Copy built frontend from Stage 1
COPY --from=client-build /usr/src/app/build ./client/build

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose the application port
EXPOSE 3900

# Health Check (Uses native Node to avoid external dependencies like curl/wget)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3900', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode); process.exit(0)}).on('error', (e) => {console.error(e); process.exit(1)})"

# Start the application
CMD ["npm", "start"]
