FROM node:16-alpine
ENV UDEV=on
RUN apk add --no-cache curl
RUN apk add --no-cache gettext

RUN npm install pm2@latest -g
WORKDIR /app
COPY . .

RUN curl -sf https://binaries.nats.dev/nats-io/nats-server/v2@latest | sh
COPY nats.conf.tpl /app/nats.conf.tpl


# core installation
WORKDIR /app/lib/core
RUN npm install

WORKDIR /app/lib/common
RUN npm install

WORKDIR /app/nats/core
RUN npm install

# adapter installation

WORKDIR /app/nats/adapters/direct
RUN npm install

# #gateway
# WORKDIR /app/nats/packages/gateway
# RUN npm install

# #discovery
# WORKDIR /app/nats/packages/uhura-discovery
# RUN npm install

WORKDIR /app

# Add a startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
