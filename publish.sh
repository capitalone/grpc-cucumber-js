#!/bin/bash

if [ -z "$1" ]; then
    echo VERSION is required
    exit
fi

VERSION=$1

yarn version --new-version ${VERSION}
git push
git push --tags