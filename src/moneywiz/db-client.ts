import createKnex, { Knex } from 'knex';
import { 
  Transaction, 
  GetTransactionsOpts, 
  TransactionType, 
  AccountType, 
  Account, 
  GetAccountsOpts,
  Category,
  GetCategoriesOpts,
  BaseTransaction,
  InvestmentHolding,
} from "./types";
import Big from 'big.js';
import * as model from './model';
import Objection from 'objection';

export interface Options {
  dbPath: string;
}
const ACCOUNT_GROUP_NAME = 'account_group_name';
export class MoneyWizDbClient {
  private knex: Knex;
  constructor(options: Options) {
    this.knex = createKnex({
      client: 'sqlite3',
      useNullAsDefault: true,
      //debug: true,
      connection: {
        filename: options.dbPath,
      },
    });
  }
  async close(): Promise<void> {
    await this.knex.destroy();
  }
  async getCategories(options: GetCategoriesOpts): Promise<Category[]> {
    const queryBuilder = model.Category.query(this.knex);
    if (options.offset) {
      queryBuilder.offset(options.offset);
    }
    if (options.limit) {
      queryBuilder.limit(options.limit);
    }
    const cols = [
      `${model.Category.tableName}.${model.CategoryCol.ID}`, 
      `${model.Category.tableName}.${model.CategoryCol.NAME}`,
    ];
    const rawCategories = await queryBuilder
      .select(cols)
      .withGraphFetched({
        [model.CategoryRel.PARENT_INFO]: {
          $recursive: 10,
          $modify: 'selectForCategory',
        },
      })
      .modifiers({
        selectForCategory(builder) {
          builder.select(cols);
        },
      });
    return rawCategories.map((rawCategory) => {
      return this.mapCategory(rawCategory);
    });
  }
  async getAccounts(options: GetAccountsOpts): Promise<Account[]>{
    const queryBuilder = model.Account.query(this.knex);
    if (options.offset) {
      queryBuilder.offset(options.offset);
    }
    if (options.limit) {
      queryBuilder.limit(options.limit);
    }
    this.selectForAccount(queryBuilder);
    const rawAccounts = await queryBuilder;
    return rawAccounts.map((rawAccount) => this.mapAccount(rawAccount));
  }
  private selectForAccount(builder: Objection.AnyQueryBuilder) {
    // The "id" of "AccountGroup" table may be an integer that overflows 
    // the "number" type in JavaScript. Therefore, you avoid selecting the
    // the "id" directly, and directly use JOIN.
    builder.select([
      `${model.Account.tableName}.${model.AccountCol.ID}`,
      `${model.Account.tableName}.${model.AccountCol.ACCOUNT_TYPE}`,
      `${model.Account.tableName}.${model.AccountCol.NAME}`,
      `${model.Account.tableName}.${model.AccountCol.OPENING_BALANCE}`,
      `${model.Account.tableName}.${model.AccountCol.CURRENCY_NAME}`,
      `${model.Account.tableName}.${model.AccountCol.INCLUDE_IN_NETWORTH}`,
      `${model.AccountGroup.tableName}.${model.AccountGroupCol.NAME} AS ${ACCOUNT_GROUP_NAME}`,
    ])
    .leftOuterJoin(model.AccountGroup.tableName,
      `${model.Account.tableName}.${model.AccountCol.GROUP_ID}`,
      `${model.AccountGroup.tableName}.${model.AccountGroupCol.ID}`)
  }
  async getTransactions(options: GetTransactionsOpts): Promise<Transaction[]> {
    const transactionCols = [
      model.TransactionCol.ID,
      model.TransactionCol.TRANSACTION_TYPE,
      model.TransactionCol.DESC,
      model.TransactionCol.AMOUNT,
      model.TransactionCol.DATE,
      model.TransactionCol.DESC,
      model.TransactionCol.NOTES,
      model.TransactionCol.NUMBER_OF_SHARES,
    ];
    const opposingTranCols = [
      model.TransactionCol.ID,
      model.TransactionCol.TRANSACTION_TYPE,
      model.TransactionCol.AMOUNT,
      model.TransactionCol.NUMBER_OF_SHARES,
    ];
    const accountGraph = {
      $modify: this.selectForAccount.name,
    };
    const opposingTransactionGraph = {
      $modify: 'selectForTransaction',
      [model.TransactionRel.INVESTMENT_HOLDING]: {
        $modify: 'selectForInvestmentHolding',  
      },
    };
    const queryBuilder = model.Transaction.query(this.knex)
      .select(transactionCols)
      .withGraphFetched({
        [model.TransactionRel.TAGS]: {
          $modify: 'selectForTags',
        },
        [model.TransactionRel.PAYEE_INFO]: {
          $modify: 'selectForPayee',
        },
        [model.TransactionRel.ACCOUNT_INFO]: accountGraph,
        [model.TransactionRel.RECIPIENT_INFO]: accountGraph,
        [model.TransactionRel.SENDER_INFO]: accountGraph,
        [model.TransactionRel.RECIPIENT_TRANSACTION_INFO]: opposingTransactionGraph,
        [model.TransactionRel.SENDER_TRANSACTION_INFO]: opposingTransactionGraph,
        [model.TransactionRel.CATEGORY_ASSIGNS]: {
          [model.CategoryAssignmentRel.CATEGORY_INFO]: {
            $modify: 'selectForCategory',
            [model.CategoryRel.PARENT_INFO]: {
              $recursive: 10,
              $modify: 'selectForCategory',
            },
          },
        },
        [model.TransactionRel.INVESTMENT_HOLDING]: {
          $modify: 'selectForInvestmentHolding',
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
        [this.selectForAccount.name]: this.selectForAccount,
        selectForCategory(builder) {
          builder.select(
            `${model.Category.tableName}.${model.CategoryCol.ID}`,
            `${model.Category.tableName}.${model.CategoryCol.NAME}`,
          );
        },
        selectForTransaction(builder) {
          builder.select(opposingTranCols);
        },
        selectForInvestmentHolding(builder) {
          builder.select([
            `${model.InvestmentHolding.tableName}.${model.InvestmentHoldingCol.ID}`,
            `${model.InvestmentHolding.tableName}.${model.InvestmentHoldingCol.PRICE_PER_SHARE}`,
          ]);
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
      return this.mapTransaction(rawTran);
    });
  }
  private mapTransaction(record: model.Transaction): Transaction {
    const result = this.mapBaseTransaction(record);
    const payee = record[model.TransactionRel.PAYEE_INFO];
    const account = record[model.TransactionRel.ACCOUNT_INFO];
    const recipientAccount = record[model.TransactionRel.RECIPIENT_INFO];
    const senderAccount = record[model.TransactionRel.SENDER_INFO];
    const recipientTran = record[model.TransactionRel.RECIPIENT_TRANSACTION_INFO];
    const senderTran = record[model.TransactionRel.SENDER_TRANSACTION_INFO];
    let recipientAmount: Big | undefined = undefined;
    let recipientNumberOfShares: Big | undefined = undefined;
    if (recipientTran) {
      recipientAmount = recipientTran ? new Big(recipientTran[model.TransactionCol.AMOUNT]) : undefined;
      recipientNumberOfShares = recipientTran ? new Big(recipientTran[model.TransactionCol.NUMBER_OF_SHARES]) : undefined;
    }
    return {
      ...result,
      date: new Date(record[model.TransactionCol.DATE]),
      description: record[model.TransactionCol.DESC] ?? '',
      recipientTransaction: recipientTran ? this.mapBaseTransaction(recipientTran) : undefined,
      senderTransaction: senderTran ? this.mapBaseTransaction(senderTran) : undefined,
      tags: record[model.TransactionRel.TAGS].map((tag) => ({
        id: tag[model.TagCol.ID],
        name: tag[model.TagCol.NAME],
      })),
      payee: payee ? {
        id: payee[model.PayeeCol.ID],
        name: payee[model.PayeeCol.NAME],
      } : undefined,
      account: this.mapAccount(account),
      desc: record[model.TransactionCol.DESC],
      notes: record[model.TransactionCol.NOTES],
      categories: record[model.TransactionRel.CATEGORY_ASSIGNS].map((c) => {
        const category = c[model.CategoryAssignmentRel.CATEGORY_INFO];
        const resultCat = {
          id: c[model.CategoryAssignmentCol.ID],
          amount: new Big(c[model.CategoryAssignmentCol.AMOUNT]),
          category: this.mapCategory(category),
        };
        return resultCat;
      }),
      recipientAccount: recipientAccount ? this.mapAccount(recipientAccount) : undefined,
      senderAccount: senderAccount ? this.mapAccount(senderAccount) : undefined,
    };
  }
  private mapBaseTransaction(rawTran: model.Transaction): BaseTransaction {
    const numShares = rawTran[model.TransactionCol.NUMBER_OF_SHARES];
    const investmentHolding = rawTran[model.TransactionRel.INVESTMENT_HOLDING];
    return {
      id: rawTran[model.TransactionCol.ID],
      type: rawTran[model.TransactionCol.TRANSACTION_TYPE] as TransactionType,
      amount: new Big(rawTran[model.TransactionCol.AMOUNT]),
      numberOfShares: numShares ? new Big(numShares) : undefined,
      investmentHolding: investmentHolding ? this.mapInvestmentHolding(investmentHolding) : undefined,
    };
  }
  private mapInvestmentHolding(record: model.InvestmentHolding): InvestmentHolding {
    return {
      id: record[model.InvestmentHoldingCol.ID],
      pricePerShare: new Big(record[model.InvestmentHoldingCol.PRICE_PER_SHARE]),
    };
  }
  private mapCategory(record: model.Category): Category {
    const result: Category = {
      id: record[model.CategoryCol.ID],
      name: record[model.CategoryCol.NAME],
    };
    let nowCat: model.Category = record;
    let nowResultCat: Category = result;
    while (nowCat) {
      const parent = nowCat[model.CategoryRel.PARENT_INFO];
      if (!parent) {
        break;
      }
      nowResultCat.parent = {
        id: parent[model.CategoryCol.ID],
        name: parent[model.CategoryCol.NAME],
      };
      nowCat = parent;
      nowResultCat = nowResultCat.parent;
    }
    return result;
  }
  private mapAccount(record: model.Account & {[ACCOUNT_GROUP_NAME]?: string}): Account {
    return {
      id: record[model.AccountCol.ID],
      name: record[model.AccountCol.NAME],
      type: record[model.AccountCol.ACCOUNT_TYPE] as AccountType,
      openingBalance: new Big(record[model.AccountCol.OPENING_BALANCE]),
      currency: record[model.AccountCol.CURRENCY_NAME],
      includeInNetworth: record[model.AccountCol.INCLUDE_IN_NETWORTH],
      groupName: record[ACCOUNT_GROUP_NAME] as string,
    };
  }
}
