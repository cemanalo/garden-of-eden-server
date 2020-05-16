#!/bin/bash

# Stop all servers and start the server as a daemon
forever stopall
cp .env.qa .env

forever start /opt/app/app.js