# FROM node:16-alpine
# FROM node:16-alpine
FROM ubuntu:22.04 as build

# Environment variables for Rust installation
ENV UDEV=on
ENV RUSTUP_HOME=/usr/local/rustup
ENV CARGO_HOME=/usr/local/cargo
ENV PATH=/usr/local/cargo/bin:$PATH

# Install dependencies

# NVM
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION v18.20.3
RUN apt update && apt install -y curl
RUN mkdir -p /usr/local/nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use --delete-prefix $NODE_VERSION"
ENV NODE_PATH $NVM_DIR/versions/node/$NODE_VERSION/bin
ENV PATH $NODE_PATH:$PATH


RUN apt update && apt install -y gettext musl-dev unzip  supervisor protobuf-compiler nano tmux 
# protoc build-base
# Install PM2
RUN npm install pm2@latest -g

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN rustup install stable
RUN rustup default stable

# Install NATS server
RUN curl -sf https://binaries.nats.dev/nats-io/nats-server/v2@latest | sh

# Install Zenoh
# RUN curl -L https://github.com/eclipse-zenoh/zenoh/releases/download/0.11.0-rc.3/zenoh-0.11.0-rc.3-x86_64-unknown-linux-musl-standalone.zip -o zenoh.zip \
    # && unzip zenoh.zip -d /usr/local/bin \
    # && rm zenoh.zip
RUN echo "deb [trusted=yes] https://download.eclipse.org/zenoh/debian-repo/ /" | tee -a /etc/apt/sources.list.d/zenoh.list > /dev/null
RUN apt update
RUN apt install -y zenoh

# Set up application directories and install Node.js dependencies
WORKDIR /app
COPY . .

COPY nats.conf.tpl /app/nats.conf.tpl

# Core installation
# WORKDIR
RUN cd  /app/lib/core && npm install

# WORKDIR /app/lib/common
RUN cd /app/lib/common && npm install

# WORKDIR /app/nats/core
RUN cd /app/nats/core && npm install

# Adapter installation
# WORKDIR /app/nats/adapters/zenoh
RUN cd /app/nats/adapters/zenoh && chmod +x start.sh && cargo build

# # Uncomment if needed
# # Gateway
# WORKDIR /app/nats/packages/gateway
# RUN npm install

# # Discovery
# WORKDIR /app/nats/packages/uhura-discovery
# RUN npm install

WORKDIR /app

COPY supervisord.conf /etc/supervisord.conf

# Add a startup script
# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /app/start-nats.sh

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
