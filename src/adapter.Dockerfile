FROM node:16
ENV UDEV=on
WORKDIR /app
COPY . .

WORKDIR lib/core
RUN npm install

WORKDIR ../common
RUN npm install

WORKDIR ../../nats/adapters/direct
RUN npm install

