listen: $NATS_SERVER_ADDRESS
server_name: $ID
max_payload: 2Mb

cluster {
  listen: 0.0.0.0:$NATS_CLUSTER_PORT
  routes = [
    $ROUTES
  ]
}