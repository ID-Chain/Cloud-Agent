#!/bin/bash
set -e

# check if node_modules exist (to support live-reload through volume bind-mount)
if [ ! -d 'node_modules' ]; then
    echo "no node_modules found, installing node dependencies.."
    npm install
fi

# run docker CMD
exec "$@"
