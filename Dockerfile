FROM node:25-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 9090
CMD ["node", "index.js"]