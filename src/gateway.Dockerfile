FROM node:16
ENV UDEV=on
WORKDIR /app
COPY . .

WORKDIR nats/packages/gateway
RUN npm install