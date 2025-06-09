FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install && npm rebuild bcrypt

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
