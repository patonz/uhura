FROM node:16
ENV UDEV=on
WORKDIR /test_results
WORKDIR /app
COPY . .

WORKDIR nats/packages/uhura-discovery
RUN npm install