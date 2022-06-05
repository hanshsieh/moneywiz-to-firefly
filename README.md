# Introduction
This repository implements a tool for migrating from MoneyWiz 3 to Firefly III.  
It reads the SQLite database file of Moneywiz and call the APIs of Firefly III to do the migration.  

*Why don't we use the migration tool of Firefly III?*  
The migration tool of Firefly III doesn't support the reconciliation transaction. And it doesn't support
migrating currencies and accounts. Moreover, the Moneywiz app has some bugs that may prevent you from exporting
CSV, especially for investment accounts.  

*Does it support Moneywiz 2021?*  
Unfornately, no.  

# Usage
Before you actually do the migration, it's highly suggested that you do the migration to a local Firefly instance to
check it everything works as expected.  
See [here](./local/README.md) for the instructions for deploying a local Firefly instance.  
When you are ready to do the migration to the real Firefly instance, follow the same steps as migrating to the local Firefly instance,
but use the following command to generate the config:
```bash
cat config/local-production.ts.example | 
  ACCESS_TOKEN='${ACCESS_TOKEN}' \
  envsubst > config/local-production.ts
```
Run the command below to do the migration:
```bash
npm run migrate:production
```
