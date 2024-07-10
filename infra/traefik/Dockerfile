FROM alpine:3.16.2

WORKDIR /tmp
RUN wget https://github.com/traefik/traefik/releases/download/v2.6.6/traefik_v2.6.6_linux_amd64.tar.gz
RUN mkdir -p /tmp/traefik/
RUN tar -xzf /tmp/traefik_v2.6.6_linux_amd64.tar.gz -C /tmp/traefik/
RUN mv /tmp/traefik/traefik /usr/bin/traefik

WORKDIR /traefik/

COPY traefik.yml ./traefik.yml

CMD traefik