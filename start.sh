#!/bin/bash

rm -rf node_modules

npm install

npm install broker-manager-0.2.1.tgz

node app.js
