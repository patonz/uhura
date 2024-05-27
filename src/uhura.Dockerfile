FROM node:16-alpine

# Environment variables for Rust installation
ENV UDEV=on
ENV RUSTUP_HOME=/usr/local/rustup
ENV CARGO_HOME=/usr/local/cargo
ENV PATH=/usr/local/cargo/bin:$PATH

# Install dependencies
RUN apk add --no-cache curl
RUN apk add --no-cache gettext
RUN apk add --no-cache musl-dev build-base
RUN apk add --no-cache unzip
RUN apk add --no-cache protoc

# Install PM2
RUN npm install pm2@latest -g

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN rustup install stable
RUN rustup default stable

# Install NATS server
RUN curl -sf https://binaries.nats.dev/nats-io/nats-server/v2@latest | sh

# Set up application directories and install Node.js dependencies
WORKDIR /app
COPY . .

COPY nats.conf.tpl /app/nats.conf.tpl

# Core installation
WORKDIR /app/lib/core
RUN npm install

WORKDIR /app/lib/common
RUN npm install

WORKDIR /app/nats/core
RUN npm install

# Adapter installation
WORKDIR /app/nats/adapters/zenoh
RUN cargo build

# # Uncomment if needed
# # Gateway
# WORKDIR /app/nats/packages/gateway
# RUN npm install

# # Discovery
# WORKDIR /app/nats/packages/uhura-discovery
# RUN npm install

WORKDIR /app

# Add a startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
