FROM node:16
ENV UDEV=on

RUN npm install pm2@latest -g
WORKDIR /app
COPY . .

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

#gateway
WORKDIR /app/nats/packages/gateway
RUN npm install

#discovery
WORKDIR /app/nats/packages/uhura-discovery
RUN npm install

WORKDIR /app
CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
