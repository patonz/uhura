#!/bin/bash
export TAG=$1
echo building with tag $TAG
docker compose -f build.yml up


function push {
    docker push patonz/uhura:core_${TAG}
    
    docker push patonz/uhura:gateway_${TAG}
    
    docker push patonz/uhura:discovery_${TAG}
    
    docker push patonz/uhura:adapter_nats_${TAG}
}

while true; do
    read -p "Do you wish to push on dockerhub? " yn
    case $yn in
        [Yy]* ) push; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

