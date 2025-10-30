FROM node:20-alpine
WORKDIR /app

# Install dependencies only
COPY server/package*.json ./
RUN npm ci --omit=dev || npm i --omit=dev

# Copy source
COPY server/. ./

# Install PM2 for production process management
RUN npm i -g pm2

ENV NODE_ENV=production
EXPOSE 5699

CMD ["pm2-runtime", "server.js"]
