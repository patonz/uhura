#!/bin/sh

# Export environment variables
export UHURA_CORE_ID="$UHURA_CORE_ID"
export NATS_SERVER_ADDRESS="$NATS_SERVER_ADDRESS"
export NATS_CLUSTER_PORT="$NATS_CLUSTER_PORT"
export ID="$ID"
export ROUTES="$ROUTES"
export RUST_LOG="debug"


# Check if "zenoh" is in the ADAPTERS list
if echo "$ADAPTERS" | grep -q "zenoh"; then
    echo "Starting Zenoh adapter..."
    cd /app/nats/adapters/zenoh || exit
    # Start the Rust application
    exec cargo run
else
    echo "Zenoh adapter not included in ADAPTERS list."
    exit 0
fi


