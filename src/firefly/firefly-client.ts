import got, { Got, HTTPError } from 'got';
import snakecaseKeys from 'snakecase-keys';
import camelcaseKeys from 'camelcase-keys';
import ow from 'ow';
import { 
  AccountArray, 
  TransactionStore, 
  AccountFilter,
  TransactionSingle, 
  AccountSingle, 
  AccountStore, 
  CurrencyArray, 
  CurrencyStore,
  CurrencySingle,
  CategoryFilter,
  CategoryArray,
  CategorySingle,
  CategoryStore
} from './model';
import { CurrencyFilter } from './model/currency-filter';

export interface Options {
  baseUrl: string;
  accessToken: string;
}

/**
 * Firefly III client.
 */
export class FireflyClient {
  private httpClient: Got;
  constructor(options: Options) {
    ow(options, 'options', ow.object.partialShape({
      baseUrl: ow.string.nonEmpty,
      accessToken: ow.string.nonEmpty,
    }));
    this.httpClient = got.extend({
      prefixUrl: options.baseUrl,
      headers: {
        'Authorization': `Bearer ${options.accessToken}`,
      },
    });
  }
  async listAccount(options: AccountFilter): Promise<AccountArray> {
    try {
      const rawResp: Record<string, unknown> = await this.httpClient.get('api/v1/accounts', {
        searchParams: {
          page: options.page,
          date: options.date,
        },
      }).json();
      return <AccountArray>camelcaseKeys(rawResp, {
        deep: true,
      });
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }
  async deleteAccount(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`api/v1/accounts/${encodeURIComponent(id)}`);
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }
  /**
   * Create new account.
   * @param options - Options.
   * @returns Created account.
   */
  async storeAccount(options: AccountStore): Promise<AccountSingle> {
    try {
      const body = snakecaseKeys(options, {
        deep: true,
      });
      console.debug('Storing account: %s', JSON.stringify(body, null, 2));
      const rawResp: Record<string, unknown> = await this.httpClient.post('api/v1/accounts', {
        json: body,
      }).json();
      const rawAccountData = rawResp.data;
      return <AccountSingle>camelcaseKeys(rawResp, {
        deep: true,
      });
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }
  /**
   * Stores a new transaction.
   * @param options - Options.
   * @returns Created transaction.
   */
  async storeTransaction(options: TransactionStore): Promise<TransactionSingle> {
    try {
      const body = snakecaseKeys(options, {
        deep: true,
      });
      console.debug('Storing transaction: %s', JSON.stringify(body, null, 2));
      const rawResp: Record<string, unknown> = await this.httpClient.post('api/v1/transactions', {
        json: body,
      }).json();
      return <TransactionSingle>camelcaseKeys(rawResp, {
        deep: true,
      });
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }

  async listCurrency(options: CurrencyFilter): Promise<CurrencyArray> {
    try {
      const rawResp: Record<string, unknown> = await this.httpClient.get('api/v1/currencies', {
        searchParams: {
          page: options.page,
        },
      }).json();
      return <CurrencyArray>camelcaseKeys(rawResp, {
        deep: true,
      });
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }

  async storeCurrency(options: CurrencyStore): Promise<CurrencySingle> {
    try {
      const rawResp: Record<string, unknown> = await this.httpClient.post('api/v1/currencies', {
        json: snakecaseKeys(options, {
          deep: true,
        }),
      }).json();
      return <CurrencySingle>camelcaseKeys(rawResp, {
        deep: true,
      });
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }
  async storeCategory(options: CategoryStore): Promise<CategorySingle> {
    try {
      const body = snakecaseKeys(options, {
        deep: true,
      });
      console.debug('Storing category: %s', JSON.stringify(body, null, 2));
      const rawResp: Record<string, unknown> = await this.httpClient.post('api/v1/categories', {
        json: body,
      }).json();
      return <CurrencySingle>camelcaseKeys(rawResp, {
        deep: true,
      });
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }
  async listCategory(options: CategoryFilter): Promise<CategoryArray> {
    try {
      const rawResp: Record<string, unknown> = await this.httpClient.get('api/v1/categories', {
        searchParams: {
          page: options.page,
        },
      }).json();
      return <CategoryArray>camelcaseKeys(rawResp, {
        deep: true,
      });
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }
  async deleteCategory(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`api/v1/categories/${encodeURIComponent(id)}`);
    } catch (err) {
      throw this.mapError(err as Error);
    }
  }
  private mapError(err: Error): Error {
    if (err instanceof HTTPError) {
      return new Error(`Validation error: ${err.response.body}`);
    }
    return new Error(`Error: ${err}`);
  }

  async close(): Promise<void> {
  }
}
