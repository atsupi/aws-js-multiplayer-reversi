FROM node:18-alpine

ENV NODE_ENV=dev

WORKDIR /home/node/app
COPY server/package*.json ./
RUN npm install

COPY server/*.js ./server/
COPY client/index.html ./client/
COPY client/*.js ./client/
COPY client/assets/* ./client/assets/
EXPOSE 3000

CMD ["node", "server/server.js"]