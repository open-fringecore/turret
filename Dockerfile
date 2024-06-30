FROM node:20-bookworm

RUN npm install -g pnpm


# Download and run the Docker installation script
# Modify it to install only the Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh \
    && sh get-docker.sh

RUN usermod -aG docker $(whoami)

# RUN useradd -u 1000 -ms /bin/bash dockeruser