FROM node:20-alpine

WORKDIR /app

# Copy full monorepo
COPY . .

# Go to service
WORKDIR /app/packages/delivery-service

RUN npm install

EXPOSE 3005

CMD ["npm", "start"]