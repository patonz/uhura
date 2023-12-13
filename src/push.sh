#!/bin/bash
export TAG=$1
echo "Pushing image with tag $TAG"
docker buildx bake  -f build.yml --set *.platform=linux/amd64,linux/arm64,linux/arm/v7 --push  .
