import process from 'process';
import { FireflyClient } from '../firefly';
import { MoneyWizDbClient } from '../moneywiz';
import config, { IConfig } from 'config';
import { AccountRoleProperty, ShortAccountTypeProperty } from '../firefly/model';

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
      await this.fireflyClient.storeAccount({
        name: account.name,
        currencyCode: account.currency,
        type: ShortAccountTypeProperty.Asset,
        accountRole: AccountRoleProperty.DefaultAsset,
        includeNetWorth: account.includeInNetworth,
      });
    }
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
