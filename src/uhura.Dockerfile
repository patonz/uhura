FROM node:20-alpine

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
RUN apk add --no-cache supervisor

# Install PM2
RUN npm install pm2@latest -g

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN rustup install stable
RUN rustup default stable

# Install NATS server
RUN curl -sf https://binaries.nats.dev/nats-io/nats-server/v2@latest | sh

# Install Zenoh
RUN curl -L https://github.com/eclipse-zenoh/zenoh/releases/download/0.11.0-rc.3/zenoh-0.11.0-rc.3-x86_64-unknown-linux-musl-standalone.zip -o zenoh.zip \
    && unzip zenoh.zip -d /usr/local/bin \
    && rm zenoh.zip

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
RUN chmod +x start.sh

RUN cargo build

# # Uncomment if needed
# # Gateway
# WORKDIR /app/nats/packages/gateway
# RUN npm install

# # Discovery
# WORKDIR /app/nats/packages/uhura-discovery
# RUN npm install

WORKDIR /app

COPY supervisord.conf /etc/supervisord.conf
# COPY zenoh_config.json5 /app/zenoh_config.json5

# Add a startup script
# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /app/start-nats.sh

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
