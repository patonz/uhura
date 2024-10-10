#!/bin/sh

# Path to supervisord.conf
SUPERVISOR_CONF="/etc/supervisord.conf"

# Check for ADAPTERS environment variable and comment out sections accordingly
if ! echo "$ADAPTERS" | grep -q "nats"; then
    # Comment out NATS adapter section if not in ADAPTERS
    sed -i 's/^\[program:nats-adapter\]/;[program:nats-adapter]/' "$SUPERVISOR_CONF"
fi

if ! echo "$ADAPTERS" | grep -q "zenoh"; then
    # Comment out Zenoh adapter section if not in ADAPTERS
    sed -i 's/^\[program:zenoh-adapter\]/;[program:zenoh-adapter]/' "$SUPERVISOR_CONF"
fi

# Start supervisord with the modified configuration
exec supervisord -c "$SUPERVISOR_CONF"