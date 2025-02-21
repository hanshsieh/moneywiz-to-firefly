# Introduction
This directory contains the scripts that help you setup a local instance of Firefly III with
docker.  
It's only suitable for development purposes. Don't use it for production.  

# Usage

## Start the service
Run the service
```bash
./local/up.sh
```
The service should be up and running.  
You can use the command below to tail the logs.
```bash
./local/logs.sh
```

Open "http://localhost" with your browser.  
It will ask you to register the first account. Afterward, the registration form will be closed.  

## Setup config for migration
After registering an account, go to `Options -> Profile -> OAuth`.
Click `Create new token` under `Personal Access Token` to create a new token.  
Copy the token to your clipboard.  
Copy the example config and inject your access token.  
```bash
cat config/local-dev.ts.example | 
  ACCESS_TOKEN='${ACCESS_TOKEN}' \
  envsubst > config/local-dev.ts
```
Put your Moneywiz SQLite database file at `./moneywiz.db`. The path can be specified in config.  
You can find the way to export your Moneywiz database file at the `Settings` page of your Moneywiz installation.  

## Start migration
```bash
npm run migrate:dev
```

## Stop the service
Stop the service and remove all the resources
```bash
./local/down.sh
```
