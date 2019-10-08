FROM node:10

WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install

COPY index.js index.js

EXPOSE 1005
CMD ["node", "index.js"]