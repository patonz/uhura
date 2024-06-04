docker run -it --rm -v "./main:/app/main" --net=d_v_net --ip 172.28.0.100 --name zenoh_pure uhura-full zenohd -c /app/main/conf.json5
