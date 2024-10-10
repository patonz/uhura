FROM node:20-alpine

# Environment variables for Rust installation
ENV UDEV=on
ENV RUSTUP_HOME=/usr/local/rustup
ENV CARGO_HOME=/usr/local/cargo
ENV PATH=/usr/local/cargo/bin:$PATH

# Build-time argument to select adapters (default: zenoh,nats)
ARG ADAPTERS="nats"

# Install dependencies
RUN apk add --no-cache curl
RUN apk add --no-cache gettext
RUN apk add --no-cache musl-dev build-base
RUN apk add --no-cache unzip
RUN apk add --no-cache protoc
RUN apk add --no-cache supervisor

#RUN npm install yarn -g

# Install PM2
# RUN npm install pm2@latest -g

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN rustup install stable
RUN rustup default stable

# Install NATS server
RUN curl -sf https://binaries.nats.dev/nats-io/nats-server/v2@latest | sh

# Install Zenoh adapter only if specified
RUN if echo "$ADAPTERS" | grep -q "zenoh"; then \
    curl -L https://github.com/eclipse-zenoh/zenoh/releases/download/0.11.0-rc.3/zenoh-0.11.0-rc.3-x86_64-unknown-linux-musl-standalone.zip -o zenoh.zip \
    && unzip zenoh.zip -d /usr/local/bin \
    && rm zenoh.zip; \
    fi

# Set up application directories and install Node.js dependencies
WORKDIR /app
COPY . .

COPY nats.conf.tpl /app/nats.conf.tpl

# Core installation
WORKDIR /app/lib/core
RUN yarn install

WORKDIR /app/lib/common
RUN yarn install

WORKDIR /app/nats/core
RUN yarn install

WORKDIR /app/nats/adapters/direct
RUN if echo "$ADAPTERS" | grep -q "nats"; then \
    yarn install; \
    fi

RUN if echo "$ADAPTERS" | grep -q "zenoh"; then \
    chmod +x start.sh && \
    cargo build; \
    fi



# # Uncomment if needed
# # Gateway
# WORKDIR /app/nats/packages/gateway
# RUN npm install

# # Discovery
# WORKDIR /app/nats/packages/uhura-discovery
# RUN npm install

WORKDIR /app
COPY supervisord_setup.sh /usr/local/bin/supervisord_setup.sh
RUN chmod +x /usr/local/bin/supervisord_setup.sh




# Add a startup script
# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh
COPY supervisord.conf /etc/supervisord.conf
RUN chmod +x /app/start-nats.sh

ENTRYPOINT ["/usr/local/bin/supervisord_setup.sh"]
