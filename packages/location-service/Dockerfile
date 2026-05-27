FROM node:20-alpine

WORKDIR /app

COPY . .

WORKDIR /app/packages/location-service

RUN npm install

EXPOSE 3004

CMD ["npm", "start"]