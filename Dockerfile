# Multi-stage build for React Frontend and Node Backend

# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup Backend & Serve Frontend
FROM node:18-alpine
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Copy built frontend to backend public directory (or where express serves static files)
# Note: You might need to adjust server.js to serve static files if not already doing so.
# For this demo, we'll assume server.js is modified to serve the 'dist' folder.
COPY --from=frontend-build /app/frontend/dist ./public-frontend

# Install Azure App Insights
RUN npm install applicationinsights

# Environment variables
ENV PORT=8080
ENV NODE_ENV=production
ENV USE_HTTPS=false 
# We use HTTP in container, Azure App Service handles SSL termination

EXPOSE 8080

CMD ["node", "server.js"]
