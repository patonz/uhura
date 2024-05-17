#!/bin/sh

# Generate NATS configuration from template
envsubst < /app/nats.conf.tpl > /app/nats.conf

# Start NATS Server in the background
./nats-server -c /app/nats.conf &

# Now start PM2 with the Node.js applications
exec "$@"
