import process from 'process';
import { FireflyClient } from '../firefly';
import { MoneyWizDbClient } from '../moneywiz';
import config, { IConfig } from 'config';
import { AccountRoleProperty, CreditCardType, ShortAccountTypeProperty } from '../firefly/model';
import { AccountType } from '../moneywiz/types';

interface AccountTypeOptions {
  accountRole: AccountRoleProperty;
  creditCardType?: CreditCardType;
  monthlyPaymentDate?: string;
}

class Migrate {
  private moneywizClient: MoneyWizDbClient;
  private fireflyClient: FireflyClient;
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
  private async collectAccountNames(): Promise<Set<string>> {
    const accountNames = new Set<string>();
    for (let page = 1; ; page++) {
      const accounts = await this.fireflyClient.listAccount({
        page,
      });
      if (accounts.data.length === 0) {
        break;
      }
      for (const account of accounts.data) {
        accountNames.add(account.attributes.name);
      }
    }
    return accountNames;
  }
  private async collectCurrencyCodes(): Promise<Set<string>> {
    const codes = new Set<string>();
    for (let page = 1; ; page++) {
      const currencies = await this.fireflyClient.listCurrency({
        page,
      });
      if (currencies.data.length === 0) {
        break;
      }
      for (const currency of currencies.data) {
        codes.add(currency.attributes.code);
      }
    }
    return codes;
  }
  private async deleteAllAccounts() {
    while (true) {
      const accounts = await this.fireflyClient.listAccount({
        page: 1,
      });
      if (accounts.data.length === 0) {
        break;
      }
      for (const account of accounts.data) {
        await this.fireflyClient.deleteAccount(account.id);
      }
    }
  }
  async run(): Promise<void> {
    await this.deleteAllAccounts();
    const accounts = await this.moneywizClient.getAccounts({});
    const accountNames = await this.collectAccountNames();
    const currencyCodes = await this.collectCurrencyCodes();
    for (const account of accounts) {
      if (accountNames.has(account.name)) {
        console.info(`Account with name "${account.name}" already exists. Skipping it.`);
        continue;
      }
      if (!currencyCodes.has(account.currency)) {
        console.info(`Currency ${account.currency} doesn't exist. Creating it`);
        await this.fireflyClient.storeCurrency({
          code: account.currency,
          name: account.currency,
          symbol: account.currency,
          decimalPlaces: 2,
        });
        currencyCodes.add(account.currency);
      }
      console.info('Creating account "%s"', account.name);
      const accountTypeOptions = this.toAccountTypeOptions(account.type);
      await this.fireflyClient.storeAccount({
        name: account.name,
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
    }
  }
  private toAccountTypeOptions(accountType: AccountType): AccountTypeOptions {
    const result: AccountTypeOptions = {
      accountRole: AccountRoleProperty.Null,
    };
    switch (accountType) {
      case AccountType.BANK_CHECK:
        result.accountRole = AccountRoleProperty.DefaultAsset;
        break;
      case AccountType.BANK_SAVING:
        result.accountRole = AccountRoleProperty.SavingAsset
        break;
      case AccountType.CASH:
        result.accountRole = AccountRoleProperty.CashWalletAsset;
        break;
      case AccountType.CREDIT_CARD:
        result.accountRole = AccountRoleProperty.CcAsset;
        // The "creditCardType" can "monthlyPayment" cannot be set on the official web interface, but they
        // are required when the "accountRole" is "ccAsset"
        result.creditCardType = CreditCardType.MonthlyFull;
        result.monthlyPaymentDate = '1970-01-01';
        break;
      case AccountType.FOREX:
        result.accountRole = AccountRoleProperty.DefaultAsset;
        break;
      case AccountType.INVESTMENT:
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
