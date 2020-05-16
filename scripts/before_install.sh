#!/bin/bash

# Install node.js
curl -sL https://rpm.nodesource.com/setup_12.x | sudo bash -
sudo yum install nodejs -y

# Install nodemon
# sudo npm install nodemon -g

# Install forever module 
# https://www.npmjs.com/package/forever
sudo npm install forever -g

# Clean working folder
# sudo find /home/ubuntu/test -type f -delete