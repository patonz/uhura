#!/bin/bash
runUhura() {

    param1="UHURA_CORE_ID=NODE_$1"
    param2="SYNC_DELAY=$2"
    param3="MAX_NODES=$3"
    param4="TEST=true"
    param5="TAG=0.1.17-test"
    destdir=.env.discovery

    >$destdir

    if [ -f $destdir ]; then
        echo $param1 >> $destdir
        echo $param2 >> $destdir
        echo $param3 >> $destdir
        echo $param4 >> $destdir
        echo $param5 >> $destdir
        echo "NODES=NODE_$(($1-1));NODE_$(($1+1))">> $destdir
    fi


    wt.exe --window 0 new-tab --profile "Ubuntu-20.04" --title "NODE_$1" --tabColor "#F00" docker compose -p app$1 -f \\\\wsl.localhost\\Ubuntu-20.04\\home\\patonz\\git\\uhura\\src\\discovery-test.yml --env-file \\\\wsl.localhost\\Ubuntu-20.04\\home\\patonz\\git\\uhura\\src\\.env.discovery up
}

export SYNC_DELAY=$1
export MAX_NODES=$2

set +x
echo Uhura Discovery chain test with $SYNC_DELAY ms interval sync and chain.length of $MAX_NODES
for n in $(seq $(($MAX_NODES))); do
    echo spawning NODE $n / $MAX_NODES
    echo removing previous data..
    docker run --rm -v "app$(($n))_uhura-volume:/test_results" ubuntu /bin/sh -c "rm -rf /test_results/*"
    echo "done"
    waitTime=60
    if [ $n -eq $(($MAX_NODES)) ]; then
        echo last is NODE_$n, waiting $waitTime seconds...
        sleep $waitTime
        echo NODE_$n uhura launching...
        runUhura $n $SYNC_DELAY $MAX_NODES
        echo "done"
    else
        sleep 2
        echo NODE_$n uhura launching...
        runUhura $n $SYNC_DELAY $MAX_NODES $CURRENTPATH
        echo "done"
    fi

done
echo "enjoy"
set -x
