import createKnex, { Knex } from 'knex';
import { Transaction, GetTransactionsOpts, TransactionType, TransferWithdrawTransaction, TransferDepositTransaction, AccountType, Account } from "./types";
import Big from 'big.js';
import * as model from './model';

export class MoneyWizDbClient {
  private knex: Knex;
  constructor() {
    this.knex = createKnex({
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {
        filename: 'moneywiz_db_20220601.db',
      },
    });
  }
  async close(): Promise<void> {
    await this.knex.destroy();
  }
  async getAccounts(): Promise<Account[]>{
    const rawAccounts = await model.Account.query(this.knex)
      .select([
        model.AccountCol.ID,
        model.AccountCol.ACCOUNT_TYPE,
        model.AccountCol.NAME,
        model.AccountCol.OPENING_BALANCE,
        model.AccountCol.CURRENCY_NAME,
      ]);
    return rawAccounts.map((rawAccount) => this.mapAccount(rawAccount));
  }
  async getTransactions(options: GetTransactionsOpts): Promise<Transaction[]> {
    const queryBuilder = model.Transaction.query(this.knex)
      .select([
        model.TransactionCol.ID,
        model.TransactionCol.TRANSACTION_TYPE,
        model.TransactionCol.DESC,
        model.TransactionCol.AMOUNT,
      ])
      .withGraphFetched({
        [model.TransactionRel.TAGS]: {
          $modify: 'selectForTags',
        },
        [model.TransactionRel.PAYEE_INFO]: {
          $modify: 'selectForPayee',
        },
        [model.TransactionRel.ACCOUNT_INFO]: {
          $modify: 'selectForAccount',
        },
        [model.TransactionRel.RECIPIENT_INFO]: {
          $modify: 'selectForAccount',
        },
        [model.TransactionRel.SENDER_INFO]: {
          $modify: 'selectForAccount',
        },
      }).modifiers({
        selectForTags(builder) {
          builder.select(
            `${model.Tag.tableName}.${model.TagCol.ID}`, 
            `${model.Tag.tableName}.${model.TagCol.NAME}`);
        },
        selectForPayee(builder) {
          builder.select(
            `${model.Payee.tableName}.${model.PayeeCol.ID}`,
            `${model.Payee.tableName}.${model.PayeeCol.NAME}`);
        },
        selectForAccount(builder) {
          builder.select(
            `${model.Account.tableName}.${model.AccountCol.ID}`, 
            `${model.Account.tableName}.${model.AccountCol.NAME}`,
            `${model.Account.tableName}.${model.AccountCol.ACCOUNT_TYPE}`,
            `${model.Account.tableName}.${model.AccountCol.OPENING_BALANCE}`,
            `${model.Account.tableName}.${model.AccountCol.CURRENCY_NAME}`);
        },
      });
    if (options.offset) {
      queryBuilder.offset(options.offset);
    }
    if (options.limit) {
      queryBuilder.limit(options.limit);
    }
    const rawTrans = await queryBuilder;
    return rawTrans.map((rawTran) => {
      const payee = rawTran[model.TransactionRel.PAYEE_INFO];
      const account = rawTran[model.TransactionRel.ACCOUNT_INFO];
      const recipientAccount = rawTran[model.TransactionRel.RECIPIENT_INFO];
      const senderAccount = rawTran[model.TransactionRel.SENDER_INFO];
      const type = rawTran[model.TransactionCol.TRANSACTION_TYPE] as TransactionType;
      let result: Transaction = {
        id: rawTran[model.TransactionCol.ID],
        type: rawTran[model.TransactionCol.TRANSACTION_TYPE] as TransactionType,
        description: rawTran[model.TransactionCol.DESC] ?? '',
        amount: new Big(rawTran[model.TransactionCol.AMOUNT]),
        tags: rawTran[model.TransactionRel.TAGS].map((tag) => ({
          id: tag[model.TagCol.ID],
          name: tag[model.TagCol.NAME],
        })),
        payee: payee ? {
          id: payee[model.PayeeCol.ID],
          name: payee[model.PayeeCol.NAME],
        } : undefined,
        account: this.mapAccount(account),
      };
      if (type === TransactionType.TRANSFER_WITHDRAW) {
        result = <TransferWithdrawTransaction>{
          ...result,
          recipientAccount: this.mapAccount(recipientAccount),
        };
      } else if (type === TransactionType.TRANSFER_DEPOSIT) {
        result = <TransferDepositTransaction>{
          ...result,
          senderAccount: this.mapAccount(senderAccount),
        };
      }
      return result;
    });
  }
  private mapAccount(record: model.Account): Account {
    return {
      id: record[model.AccountCol.ID],
      name: record[model.AccountCol.NAME],
      type: record[model.AccountCol.ACCOUNT_TYPE] as AccountType,
      openingBalance: new Big(record[model.AccountCol.OPENING_BALANCE]),
      currency: record[model.AccountCol.CURRENCY_NAME],
    };
  }
}

async function main() {
  const source = new MoneyWizDbClient();
  const trans = await source.getTransactions({
    limit: 1000,
  });
  for (const tran of trans) {
    if (tran.payee) {
      console.info('tran: ', tran);
    }
  }
  const accounts = await source.getAccounts();
  for (const account of accounts) {
    console.info(account);[]
  }
  await source.close();
}
main().catch((err) => {
  console.error(err);
});