FROM docker.io/library/node:latest

RUN apt update && apt install -y node-typescript

WORKDIR /bot

COPY ./src /bot/src
COPY ./config.json /bot

WORKDIR /bot/src
RUN npm install && tsc

CMD ["node", "main.js"]
