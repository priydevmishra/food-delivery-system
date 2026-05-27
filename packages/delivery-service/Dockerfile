FROM node:20-alpine

WORKDIR /app

COPY . .

WORKDIR /app/packages/delivery-service

RUN npm install

EXPOSE 3005

CMD ["npm", "start"]