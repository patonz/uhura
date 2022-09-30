#!/bin/bash
export TAG=$1
echo building with tag $TAG
docker buildx bake -f build.yml 
#--push
# --set *.platform=linux/amd64,linux/arm64,linux/arm/v7
