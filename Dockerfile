FROM node:20-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /app
COPY package*.json ./
RUN npm ci 
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/server.js"]