#!/bin/sh

branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

if [ "$branch" = "master" ]; then
    npm install codecov && ./node_modules/codecov/bin/codecov
else
    echo "skipped"
fi
