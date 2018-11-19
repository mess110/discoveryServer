FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run browserify

EXPOSE 443

CMD ["npm", "start"]
