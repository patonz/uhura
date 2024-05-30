#!/bin/sh

# Generate NATS configuration from template
envsubst < /app/nats.conf.tpl > /app/nats.conf

# Start NATS Server
exec ../nats-server -c /app/nats.conf