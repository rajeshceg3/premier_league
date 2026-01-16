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

# Start the application
CMD ["npm", "start"]
