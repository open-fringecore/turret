FROM node:20-bookworm

RUN npm install -g pnpm

RUN curl -fsSL https://get.docker.com -o get-docker.sh \
    && sh get-docker.sh

RUN usermod -aG docker $(whoami)