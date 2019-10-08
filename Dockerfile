FROM node:10.9.0

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 1005
CMD ["node", "index.js"]