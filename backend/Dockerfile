FROM node:18.14.1

WORKDIR /app

copy package*.json .
run npm install 
copy . .
cmd node index.js