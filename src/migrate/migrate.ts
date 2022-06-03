import process from 'process';
import config, { IConfig } from 'config';
import ow from 'ow';
import { FireflyClient } from '../firefly';
import { MoneyWizDbClient } from '../moneywiz';
import {
  AccountRoleProperty, 
  CreditCardType, 
  ShortAccountTypeProperty, 
  TransactionTypeProperty, AccountRead 
} from '../firefly/model';
import * as moneywiz from '../moneywiz/types';

interface AccountTypeOptions {
  accountRole: AccountRoleProperty;
  creditCardType?: CreditCardType;
  monthlyPaymentDate?: string;
}
interface TransactionInfo {
  desc: string;
  transType: TransactionTypeProperty;
  foreignAmount?: string;
  foreignCurrencyCode?: string;
  sourceId?: string;
  sourceName?: string;
  destinationId?: string;
  destinationName?: string;
}
interface SplitInfo {
  amount: string;
  categoryName?: string;
}

class Migrate {
  private moneywizClient: MoneyWizDbClient;
  private fireflyClient: FireflyClient;
  private readonly fireflyAccounts: AccountRead[] = [];
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
        console.info('Deleting account "%s"', account.attributes.name);
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
    await this.collectFireflyAccounts();
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
  private async collectFireflyAccounts() {
    this.fireflyAccounts.length = 0;
    for (let page = 1;; page++) {
      const accounts = await this.fireflyClient.listAccount({
        page,
      });
      if (accounts.data.length === 0) {
        break;
      }
      this.fireflyAccounts.push(...accounts.data);
    }
  }
  private findFireflyAccountByName(name: string): AccountRead | undefined {
    for (const account of this.fireflyAccounts) {
      if (account.attributes.name === name) {
        return account;
      }
    }
    return undefined;
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
    if (transaction.amount.eq(0)) {
      console.warn('Ignoring transaction with amount 0. transactionId=%s', transaction.id);
      return undefined;
    }
    if (!transaction.type) {
      console.warn('Ignoring transaction with empty type. It can happen because of Moneywiz\'s bug. transactionId=%s',
        transaction.id);
      return undefined;
    }
    let transType: TransactionTypeProperty;
    let foreignAmount: string | undefined;
    let foreignCurrencyCode: string | undefined;
    let sourceName: string | undefined;
    let sourceId: string | undefined;
    let destinationName: string | undefined;
    let destinationId: string | undefined;
    switch (transaction.type) {
      case moneywiz.TransactionType.DEPOSIT:
      case moneywiz.TransactionType.REFUND:
        transType = TransactionTypeProperty.Deposit;
        sourceName = transaction.payee?.name
        destinationName = this.toAccountName(transaction.account);
        break;
      case moneywiz.TransactionType.WITHDRAW:
        transType = TransactionTypeProperty.Withdrawal;
        sourceName = this.toAccountName(transaction.account),
        destinationName = transaction.payee?.name;
        break;
      case moneywiz.TransactionType.TRANSFER_WITHDRAW:
        transType = TransactionTypeProperty.Transfer;
        ow(transaction, ow.object.partialShape({
          recipientAmount: ow.object,
          recipientAccount: ow.object,
        }));
        foreignAmount = transaction.recipientAmount.abs().toFixed();
        foreignCurrencyCode = transaction.recipientAccount.currency;
        sourceName = this.toAccountName(transaction.account);
        destinationName = this.toAccountName(transaction.recipientAccount);
        break;
      case moneywiz.TransactionType.RECONCILE:
        return undefined;
        /*
        transType = TransactionTypeProperty.Reconciliation;
        const accountName = transaction.account.name;
        const reconcileAccountName = this.toReconcileAccountName(accountName, transaction.account.currency);
        const account = this.findFireflyAccountByName(accountName);
        const reconcileAccount = this.findFireflyAccountByName(accountName);
        if (!account || !reconcileAccount) {
          throw new Error(`Failed to find account by name "${accountName}" and "${reconcileAccountName}"`);
        }
        // When creating a reconcilation transaction, we must use ID instead of name for the source
        // and destination account.
        if (transaction.amount.cmp(0) < 0) {
          sourceId = account.id;
          destinationId = reconcileAccount.id;
        } else {
          sourceId = reconcileAccount.id;
          destinationId = account.id;
        }
        break;*/
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
      // Firefly doesn't allow an empty description
      desc: transaction.desc ? transaction.desc : '(empty)',
      transType,
      foreignAmount,
      foreignCurrencyCode,
      sourceId,
      sourceName,
      destinationId,
      destinationName,
    };
  }
  private toSplitInfo(transaction: moneywiz.Transaction): SplitInfo[] {
    const result: SplitInfo[] = [];
    // Transfer and reconcilation transactions won't have a category.
    if (transaction.categories.length === 0) {
      return [
        {
          amount: transaction.amount.abs().toFixed(),
        },
      ];
    }
    for (const categoryAssign of transaction.categories) {
      // Firefly doesn't allow a transaction split with amount <= 0
      if (categoryAssign.amount.eq(0)) {
        continue;
      }
      const categoryName = this.toCategoryName(categoryAssign.category);
      result.push({
        amount: categoryAssign.amount.abs().toFixed(),
        categoryName,
      });
    }
    return result;
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
    const splitInfos = this.toSplitInfo(transaction);
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
            amount: s.amount,
            foreignAmount: transInfo.foreignAmount,
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
    if (account.group) {
      accountName = `${account.group.name} > ${accountName}`;
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

async function main() {
  const migrate = new Migrate();
  try {
    await migrate.run();
  } finally {
    await migrate.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
