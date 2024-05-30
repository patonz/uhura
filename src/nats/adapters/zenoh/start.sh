#!/bin/sh

# Export environment variables
export UHURA_CORE_ID="$UHURA_CORE_ID"
export NATS_SERVER_ADDRESS="$NATS_SERVER_ADDRESS"
export NATS_CLUSTER_PORT="$NATS_CLUSTER_PORT"
export ID="$ID"
export ROUTES="$ROUTES"
export RUST_LOG="debug"

# Start the Rust application
exec cargo run