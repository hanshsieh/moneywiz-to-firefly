# Introduction
This repository implements a tool for migrating the data from MoneyWiz 3 to Firefly III.  
It reads the SQLite database file of Moneywiz and calls the APIs of Firefly III to migrate.  

*Why don't we use the migration tool of Firefly III?*  
The migration tool of Firefly III [doesn't support the reconciliation transaction](https://github.com/firefly-iii/firefly-iii/issues/6130).
And it doesn't support migrating currencies and accounts. Moreover, the Moneywiz app has some bugs that may
prevent you from exporting the CSV, especially for investment accounts.  

*Does it support Moneywiz 2021?*  
Unfornately, no.  

Before using this tool, here's a list of operations that will and won't be done by this tool:
- Will
  - **Delete the existing accounts, transactions, and categories from Firefly.**
  - Migrate all the accounts. It should work for the accounts synced with banks and with manual transactions but because
    I don't use the sync feature, let me know if it doesn't work for you. Here's a mapping between Moneywiz account types
    and Firefly account types:
    - Bank check -> Default asset
    - Bank saving -> Saving asset
    - Cash -> Cash wallet asset
    - Credit card -> Credit card asset
    - Forex (cyprocurrency) -> Default asset
    - Investment -> Default asset
  - Migrate all the expense, income, and transfer transactions.
  - Tags, descriptions, notes of a transaction will be migrated.
  - Migrate the transactions with multiple categories by creating split transactions. Transactions that span
    across multiple accounts will become multiple transactions, so it works as well.
  - For expense transactions, the payee will be used as the expense account.
  - For income transactions, the payee will be used as the revenue account.
  - For reconciliation transactions (adjust balance), if the amount is negative, it will be created as an expense
    transaction with the destination account being `(reconciliation)`. If the amount is positive, it will be created as
    a revenue transaction with the source account being `(reconciliation)`. The reason why it doesn't use the reconciliation transaction of Firefly
    is because the [Firefly API doesn't currently support it](https://github.com/firefly-iii/firefly-iii/issues/6130).
  - If an account `MyAccount` is under group `MyGroup`, a Firefly account will be created with the name `MyGroup > MyAccount`. Currently, customization
    is not supported. If you need customization, send me an issue.
  - If a category `C2` is under another parent category `C1`, a Firefly category `C1 > C2` will be created.
  - If a currency is used by a transaction, and the currency doesn't exist in Firefly, a new currency will be created. The name, symbol, and code
    will all be the currency code and the number of decimal places will be 2. You can adjust that after the migration. It won't affect the precision
    of the migrated transactions. It only affects how the amount is displayed.
  - The opening balance of an account is mapped to the virtual balance of Firefly. Firefly has the concept of opening balance and virtual balance. The
    opening balance on Firefly requires an opening date. In Moneywiz, there's no opening date. The amount is always added to the balance. Therefore, this
    tool maps the opening balance of Moneywiz to the virtual balance of Firefly.
- Won't
  - It doesn't handle buy and sell transactions within an investment account. Therefore, you may find the total balance
    on Firefly doesn't match what you see on Moneywiz.
  - It won't delete the existing currencies on Firefly.
  - It won't migrate the budgets.
  - It doesn't support loan accounts for now. Let me know if you need it.
  - Moneywiz supports recording the amount in original currency. For example, you can create a transaction that deposit
    10 EUR to an account with USD. Moneywiz will record the amount in both EUR and USD. Firefly cannot store this kind of information,
    so this tool only stores the amount in USD.

Please star this repository if it helps you! :)

# Usage

## Prerequisites
- nodejs >= 20  
  To install it, you can follow the instructions at the [official site](https://nodejs.org/en/download).
- bash
- docker-engine
  See [here](https://docs.docker.com/engine/install/) for the installation instructions.

A Docker engine is only needed for the local migration.  
This tool assumes a Unix-based environment. For Windows, it's recommended to prepare a WSL distribution as below:  

- [Install Docker Desktop](https://docs.docker.com/desktop/)
- [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install)
- Start your WSL distribution (e.g. Ubuntu), and run this tool inside it.

If you are unable to install WSL (e.g. Your Windows version is too old), you can look into the scripts used by this tool, and try to do the same things manually on Windows. The core migration logic is written in NodeJS, so it should work on all platforms.


## Local Migration
Before you migrate, it's highly suggested that you migrate to a local Firefly instance to
check if everything works as expected.  
See [here](./local/README.md) for the instructions of deploying a local Firefly instance.  
Here's a checklist that you might find it helpful to see if the migration works as expected.
- Check the balance of each asset account to see if they match what you see on Moneywiz. 
- Check if the account numbers and names match.

## Production Migration
When you are ready to do the migration to the real Firefly instance, follow the same steps as migrating to the local Firefly instance,
but use the following command to generate the config:
```bash
cat config/local-production.ts.example | 
  ACCESS_TOKEN='${ACCESS_TOKEN}' \
  envsubst > config/local-production.ts
```
Run the command below to migrate:
```bash
npm run migrate:production
```
