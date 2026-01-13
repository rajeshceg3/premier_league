FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Environment variables
ENV PORT=3900
ENV NODE_ENV=production

# Expose port
EXPOSE 3900

# Start the application
CMD ["npm", "start"]
