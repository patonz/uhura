FROM node:16
ENV UDEV=on
WORKDIR /app
COPY . .

WORKDIR nats/packages/uhura-discovery
RUN npm install