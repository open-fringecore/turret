FROM node:20-bookworm

RUN npm install -g pnpm

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release

# Download and run the Docker installation script
# Modify it to install only the Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh \
    && sed -i 's/apt-get install -y -q docker-ce$/apt-get install -y -q docker-ce-cli/' get-docker.sh \
    && sh get-docker.sh

# Cleanup
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /get-docker.sh

# Continue with your Dockerfile commands