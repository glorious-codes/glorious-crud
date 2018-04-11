#!/bin/sh

branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

if [ "$branch" = "master" ]; then
    npm install -g codecov --unsafe-perm && codecov
else
    echo "skipped"
fi
