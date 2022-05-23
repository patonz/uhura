FROM balenalib/raspberrypi4-64-node:latest
RUN install_packages python3 make g++
ENV UDEV=on
WORKDIR /app
COPY . .
WORKDIR lib/adapters/blesh
RUN npm install
WORKDIR ../../common
RUN npm install
WORKDIR ../../nats/adapters/blesh
RUN npm install
