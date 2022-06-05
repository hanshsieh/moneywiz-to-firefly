import config, { IConfig } from 'config';
import ow from 'ow';
import { FireflyClient } from '../firefly';
import { MoneyWizDbClient } from '../moneywiz';
import {
  AccountRoleProperty, 
  CreditCardType, 
  ShortAccountTypeProperty, 
  TransactionTypeProperty, 
} from '../firefly/model';
import * as moneywiz from '../moneywiz/types';
import Big from 'big.js';

interface AccountTypeOptions {
  accountRole: AccountRoleProperty;
  creditCardType?: CreditCardType;
  monthlyPaymentDate?: string;
}
interface TransactionInfo {
  id: number;
  desc: string;
  transType: TransactionTypeProperty;
  amount: Big;
  foreignAmount?: Big;
  foreignCurrencyCode?: string;
  sourceId?: string;
  sourceName?: string;
  destinationId?: string;
  destinationName?: string;
  categories: moneywiz.CategoryAssign[];
}
interface SplitInfo {
  amount: Big;
  categoryName?: string;
}
const EMPTY_PLACEHOLDER = '(none)';
export class Migrate {
  private moneywizClient: MoneyWizDbClient;
  private fireflyClient: FireflyClient;
  private readonly moneywizAccounts: moneywiz.Account[] = [];
  private readonly moneywizCurrencies: Set<string> = new Set();
  constructor() {
    const fireflyConf = config.get<IConfig>('firefly');
    const moneywizConf = config.get<IConfig>('moneywiz');
    this.fireflyClient = new FireflyClient({
      baseUrl: fireflyConf.get('baseUrl'),
      accessToken: fireflyConf.get('accessToken'),
    });
    this.moneywizClient = new MoneyWizDbClient({
      dbPath: moneywizConf.get('dbPath'),
    });
  }
  private async collectCurrencyCodes(): Promise<void> {
    this.moneywizCurrencies.clear();
    for (let page = 1; ; page++) {
      const currencies = await this.fireflyClient.listCurrency({
        page,
      });
      if (currencies.data.length === 0) {
        break;
      }
      for (const currency of currencies.data) {
        this.moneywizCurrencies.add(currency.attributes.code);
      }
    }
  }
  private async deleteAllAccounts() {
    console.info('Deleting all accounts');
    while (true) {
      const accounts = await this.fireflyClient.listAccount({
        page: 1,
      });
      if (accounts.data.length === 0) {
        break;
      }
      for (const account of accounts.data) {
        console.info('Deleting %s account "%s"', account.attributes.type, account.attributes.name);
        await this.fireflyClient.deleteAccount(account.id);
      }
    }
  }
  private async deleteAllCategories() {
    console.info('Deleting all categories');
    while (true) {
      const categories = await this.fireflyClient.listCategory({
        page: 1,
      });
      if (categories.data.length === 0) {
        break;
      }
      for (const category of categories.data) {
        await this.fireflyClient.deleteCategory(category.id);
      }
    }
  }
  private async migrateCategories(): Promise<void> {
    const categoryNames = new Set<String>();
    for (let offset = 0;;) {
      const categories = await this.moneywizClient.getCategories({
        offset,
      });
      if (categories.length === 0) {
        break;
      }
      for (const category of categories) {
        const categoryName = this.toCategoryName(category);
        // Moneywiz distinguish the category between expense and income, so it's possible
        // that there're duplicate categories.
        if (categoryNames.has(categoryName)) {
          continue;
        }
        categoryNames.add(categoryName);
        await this.fireflyClient.storeCategory({
          name: categoryName,
        });
      }
      offset += categories.length;
    }
  }
  async run(): Promise<void> {
    await this.collectMoneywizAccounts();
    await this.collectCurrencyCodes();
    await this.deleteAllAccounts();
    await this.deleteAllCategories();
    await this.migrateCategories();
    await this.migrateAccounts();
    await this.migrateTransactions();
  }
  private async collectMoneywizAccounts() {
    this.moneywizAccounts.length = 0;
    for (let offset = 0;;) {
      const accounts = await this.moneywizClient.getAccounts({
        offset,
        limit: 1000,
      });
      if (accounts.length === 0) {
        break;
      }
      this.moneywizAccounts.push(...accounts);
      offset += accounts.length;
    }
  }
  private async migrateTransactions(): Promise<void> {
    const pageSize = 1000;
    for (let offset = 0;;) {
      const transactions = await this.moneywizClient.getTransactions({
        offset,
        limit: pageSize,
      });
      if (transactions.length === 0) {
        break;
      }
      for (const transaction of transactions) {
        await this.migrateTransaction(transaction);
      }
      offset += transactions.length;
    }
  }
  private toTransactionInfo(transaction: moneywiz.Transaction): TransactionInfo | undefined {
    let amount: Big = this.toTransactionAmount(transaction);
    if (amount.eq(0)) {
      console.warn('Ignoring transaction with amount 0. transactionId=%s', transaction.id);
      return undefined;
    }
    if (!transaction.type) {
      console.warn('Ignoring transaction with empty type. It can happen because of Moneywiz\'s bug. transactionId=%s',
        transaction.id);
      return undefined;
    }
    let transType: TransactionTypeProperty;
    let foreignAmount: Big | undefined;
    let foreignCurrencyCode: string | undefined;
    let sourceName: string | undefined;
    let sourceId: string | undefined;
    let destinationName: string | undefined;
    let destinationId: string | undefined;
    switch (transaction.type) {
      case moneywiz.TransactionType.DEPOSIT:
      case moneywiz.TransactionType.REFUND:
        transType = TransactionTypeProperty.Deposit;
        sourceName = this.toRevenueAccountName(transaction.payee?.name);
        destinationName = this.toAccountName(transaction.account);
        break;
      case moneywiz.TransactionType.WITHDRAW:
        transType = TransactionTypeProperty.Withdrawal;
        sourceName = this.toAccountName(transaction.account),
        destinationName = this.toExpenseAccountName(transaction.payee?.name);
        break;
      case moneywiz.TransactionType.TRANSFER_WITHDRAW:
        transType = TransactionTypeProperty.Transfer;
        ow(transaction, ow.object.partialShape({
          recipientTransaction: ow.object,
          recipientAccount: ow.object,
        }));
        foreignAmount = this.toTransactionAmount(transaction.recipientTransaction);
        foreignCurrencyCode = transaction.recipientAccount.currency;
        sourceName = this.toAccountName(transaction.account);
        destinationName = this.toAccountName(transaction.recipientAccount);
        break;
      case moneywiz.TransactionType.RECONCILE:
        // Currently, Firefly doesn't support creating reconciliation transaction with API
        // so we convert it to withdrawal or deposit transaction.
        // See https://github.com/firefly-iii/firefly-iii/discussions/6129
        if (transaction.amount.cmp(0) < 0) {
          transType = TransactionTypeProperty.Withdrawal;
          sourceName = this.toAccountName(transaction.account),
          destinationName = this.getReconcileAccountName();
        } else {
          transType = TransactionTypeProperty.Deposit;
          sourceName = this.getReconcileAccountName();
          destinationName = this.toAccountName(transaction.account);
        }
        break;
      case moneywiz.TransactionType.TRANSFER_DEPOSIT:
      case moneywiz.TransactionType.INVESTMENT_BUY:
      case moneywiz.TransactionType.INVESTMENT_SELL:
      case moneywiz.TransactionType.INVESTMENT_EXCHANGE:
        // We do no handle these transactions.
        return undefined;
      default:
        throw new Error(`Unknown transaction type "${transaction.type}"`);
    }
    return {
      id: transaction.id,
      // Firefly doesn't allow an empty description
      desc: this.toNonEmptyStr(transaction.desc),
      transType,
      amount,
      foreignAmount,
      foreignCurrencyCode,
      sourceId,
      sourceName,
      destinationId,
      destinationName,
      categories: transaction.categories,
    };
  }
  private toTransactionAmount(tran: moneywiz.BaseTransaction): Big {
    // It's observed that for some old transfer transaction, if the source or destination currency doens't match
    // the currency of the corresponding account, the db may not have the correct 'amount' field.
    // In this case, try to use the 'numberOfShares' field.
    if (tran.amount.cmp(0) !== 0) {
      return tran.amount.abs();
    }
    if (tran.numberOfShares && tran.investmentHolding) {
      console.warn('Amount of transaction is 0, change to use "numberOfShares". transactionId=%s', tran.id);
      return tran.numberOfShares.mul(tran.investmentHolding.pricePerShare).abs();
    }
    return tran.amount;
  }
  private toExpenseAccountName(name: string | undefined): string {
    return this.toNonEmptyStr(name);
  }
  private toRevenueAccountName(name: string | undefined): string {
    return this.toNonEmptyStr(name);
  }
  private getReconcileAccountName(): string {
    return '(reconciliation)';
  }
  private toNonEmptyStr(str: string | undefined): string {
    if (str) {
      return str;
    }
    return EMPTY_PLACEHOLDER;
  }
  private toSplitInfo(transaction: TransactionInfo): SplitInfo[] {
    const splits: SplitInfo[] = [];
    // Sort the category assignments by ID decreasingly
    const categoryAssigns = [...transaction.categories].sort((c1, c2) => {
      if (c1.id > c2.id) {
        return -1;
      } else if (c2.id < c2.id) {
        return 1;
      } else {
        return 0;
      }
    });
    const categoryIds = new Set<number>();
    for (const categoryAssign of categoryAssigns) {
      // Firefly doesn't allow a transaction split with amount <= 0
      if (categoryAssign.amount.eq(0)) {
        continue;
      }
      // Moneywiz db has a bug that there many be multiple category assignments for a same category
      // and transaction. When it happen, we take the category assignment with larger ID assuming
      // that one is newer.
      const categoryId = categoryAssign.category.id;
      if (categoryIds.has(categoryId)) {
        console.warn('Found duplicate category assignments for transaction %d. Ignoring duplicate category assignments',
            transaction.id);
        continue;
      }
      categoryIds.add(categoryId);
      const categoryName = this.toCategoryName(categoryAssign.category);
      splits.push({
        amount: categoryAssign.amount.abs(),
        categoryName,
      });
    }
    const transactionAmount = transaction.amount;
    // Transfer and reconcilation transactions won't have a category.
    if (splits.length === 0) {
      splits.push(
        {
          amount: transactionAmount,
        }
      );
    }
    let categoryAmountSum = new Big(0);
    for (const split of splits) {
      categoryAmountSum = categoryAmountSum.add(split.amount);
    }
    const amountDiff = transactionAmount.sub(categoryAmountSum);
    if (amountDiff.abs().cmp(0.01) >= 0) {
      // It's observed because of a bug of Moneywiz, it's possible that the 'amount' of the transaction
      // record doesn't match the sum of the 'amount' of the category assignments.
      // Therefore, when such a case is detected, we add the difference to the amount of the last split.
      console.warn('Detected the amount sum of category assignments doesn\'t match the transaction amount.' + 
        ' Adding %s to the last split. transactionId=%s', amountDiff.toFixed(), transaction.id);
      const oldAmount = splits[splits.length - 1].amount;
      splits[splits.length - 1].amount = new Big(oldAmount).add(amountDiff);
    }
    return splits;
  }
  private toCategoryName(category: moneywiz.Category): string {
    let categoryName = category.name;
    let ancestor = category.parent;
    while (ancestor) {
      categoryName = `${ancestor.name} > ${categoryName}`;
      ancestor = ancestor.parent;
    }
    return categoryName;
  }
  private async migrateTransaction(transaction: moneywiz.Transaction): Promise<void> {
    console.info('Migrating transaction %s', transaction.id);
    const transInfo = this.toTransactionInfo(transaction);
    if (!transInfo) {
      return;
    }
    const splitInfos = this.toSplitInfo(transInfo);
    try {
      await this.fireflyClient.storeTransaction({
        //errorIfDuplicateHash: true,
        applyRules: true,
        fireWebhooks: true,
        groupTitle: transInfo.desc,
        transactions: splitInfos.map((s) => {
          return {
            type: transInfo.transType,
            date: transaction.date,
            amount: s.amount.toFixed(),
            foreignAmount: transInfo.foreignAmount?.toFixed(),
            foreignCurrencyCode: transInfo.foreignCurrencyCode,
            sourceId: transInfo.sourceId,
            sourceName: transInfo.sourceName,
            destinationId: transInfo.destinationId,
            destinationName: transInfo.destinationName,
            description: transInfo.desc,
            notes: transaction.notes,
            tags: transaction.tags.map((t) => t.name),
            categoryName: s.categoryName,
            internalReference: `${transaction.id}`,
          };
        }),
      });
    } catch (err) {
      console.error('Failed to migrate transaction %s', transaction.id);
      throw err;
    }
  }
  private toAccountName(account: moneywiz.Account): string {
    let accountName = account.name;
    if (account.groupName) {
      accountName = `${account.groupName} > ${accountName}`;
    }
    return accountName;
  }
  private async migrateAccounts(): Promise<void> {
    await this.collectCurrencyCodes();
    for (const account of this.moneywizAccounts) {
      if (!this.moneywizCurrencies.has(account.currency)) {
        console.info(`Currency ${account.currency} doesn't exist. Creating it`);
        await this.fireflyClient.storeCurrency({
          code: account.currency,
          name: account.currency,
          symbol: account.currency,
          decimalPlaces: 2,
        });
        this.moneywizCurrencies.add(account.currency);
      }
      const accountName = this.toAccountName(account);
      console.info('Creating account "%s"', accountName);
      const accountTypeOptions = this.toAccountTypeOptions(account.type);
      await this.fireflyClient.storeAccount({
        name: accountName,
        currencyCode: account.currency,
        type: ShortAccountTypeProperty.Asset,
        accountRole: accountTypeOptions.accountRole,
        includeNetWorth: account.includeInNetworth,
        creditCardType: accountTypeOptions.creditCardType,
        monthlyPaymentDate: accountTypeOptions.monthlyPaymentDate,
        // There's a "opening balance" for Firefly,
        // but the opening balance of Firefly requires a date, while
        // the opening balance for MoneyWiz doesn't. The semantic of MoneyWiz's
        // opening balance seems to be closer to the virtual balance of 
        // Firefly.
        virtualBalance: account.openingBalance.toFixed(),
      });
      // Create corresponding reconcilation account
      /*await this.fireflyClient.storeAccount({
        name: this.toReconcileAccountName(account.name, account.currency),
        currencyCode: account.currency,
        type: ShortAccountTypeProperty.Reconciliation,
        includeNetWorth: false,
      });*/
    }
  }
  private toReconcileAccountName(name: string, currencyCode: string): string {
    return `${name} reconciliation (${currencyCode})`;
  }
  private toAccountTypeOptions(accountType: moneywiz.AccountType): AccountTypeOptions {
    const result: AccountTypeOptions = {
      accountRole: AccountRoleProperty.Null,
    };
    switch (accountType) {
      case moneywiz.AccountType.BANK_CHECK:
        result.accountRole = AccountRoleProperty.DefaultAsset;
        break;
      case moneywiz.AccountType.BANK_SAVING:
        result.accountRole = AccountRoleProperty.SavingAsset
        break;
      case moneywiz.AccountType.CASH:
        result.accountRole = AccountRoleProperty.CashWalletAsset;
        break;
      case moneywiz.AccountType.CREDIT_CARD:
        result.accountRole = AccountRoleProperty.CcAsset;
        // The "creditCardType" can "monthlyPayment" cannot be set on the official web interface, but they
        // are required when the "accountRole" is "ccAsset"
        result.creditCardType = CreditCardType.MonthlyFull;
        result.monthlyPaymentDate = '1970-01-01';
        break;
      case moneywiz.AccountType.FOREX:
        result.accountRole = AccountRoleProperty.DefaultAsset;
        break;
      case moneywiz.AccountType.INVESTMENT:
        result.accountRole = AccountRoleProperty.DefaultAsset;
        break;
      default:
        throw new Error(`Unknown account type "${accountType}"`);
    }
    return result;
  }
  async close(): Promise<void> {
    await this.moneywizClient.close();
    await this.fireflyClient.close();
  }
}
