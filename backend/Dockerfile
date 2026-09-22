FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Run seed script on build/startup
RUN npm run seed || true

EXPOSE 5000

CMD ["npm", "start"]
