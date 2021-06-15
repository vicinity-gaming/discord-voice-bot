FROM docker.io/library/ubuntu:latest

RUN apt update && DEBIAN_FRONTEND="noninteractive" apt install -y curl npm node-typescript && npm install -g n && n latest

WORKDIR /bot

COPY ./src /bot/src
COPY ./config.json /bot

WORKDIR /bot/src
RUN npm install && tsc

CMD ["node", "main.js"]
