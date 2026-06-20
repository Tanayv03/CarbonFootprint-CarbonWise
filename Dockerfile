# Stage 1: Build the React Client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build the Node Server & Serve Client
FROM node:20-alpine
WORKDIR /app/server

# Install server dependencies
COPY server/package*.json ./
RUN npm install --only=production

# Copy server source code
COPY server/ ./

# Copy built client files from Stage 1 into the server directory
COPY --from=client-build /app/client/dist ../client/dist

# Expose port (Cloud Run sets the PORT env var automatically)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
