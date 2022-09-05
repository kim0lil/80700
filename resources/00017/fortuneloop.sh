#!/bin/bash
trap "exit" SIGINT

# delete fortuneEnv.yaml
# INTERVAL=$1

echo Configured to generate new fortune every $INTERVAL seconds

mkdir -p /var/htdocs

while :
do
    echo Writing fortune to /var/htdocs/index.html
#    echo $(data) Writing fortune to /var/htdocs/index.html
    /usr/games/fortune > /var/htdocs/index.html
    sleep $INTERVAL
#    sleep 10
done