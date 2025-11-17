FROM node:20.12.0-alpine

ENV NODE_ENV=production
WORKDIR /usr/app

# Install only production deps
COPY package.json .
RUN npm install --only=production

# Copy source
COPY . .

EXPOSE 7782

# Healthcheck to ensure the service is responding
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:7782/health > /dev/null 2>&1 || exit 1

CMD ["node", "src/index.js"]
