FROM node:current-slim

WORKDIR /app
COPY ./src ./src
COPY package.json .
COPY postgrator-config.js .

RUN ["npm", "i"]

CMD [ "npm", "start" ]

EXPOSE 8080