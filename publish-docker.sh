#!/usr/bin/env bash

set -e

docker login
VERSION=`cat ./.dockerHubVersion`
echo "Next Version? (current: "${VERSION}")"
read nversion
echo "Let's build new image with tag: idchain/cloud-agent:"${nversion}
docker build . -t idchain/cloud-agent:${nversion}
docker push idchain/cloud-agent:${nversion}
echo ${nversion} > ./.dockerHubVersion

git add ./.dockerHubVersion
msg=`echo New cloud-agent image release version: ${nversion}`
echo ${msg}
git commit -m "$msg"
git push
