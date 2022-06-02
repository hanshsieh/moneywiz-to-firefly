import { Model } from 'objection';
export enum AccountCol {
  ID = 'id',
  NAME = 'name',
  ACCOUNT_TYPE = 'accountType',
  OPENING_BALANCE = 'openingBalance',
  CURRENCY_NAME = 'currencyName',
}
export class Account extends Model {
  [AccountCol.ID]!: number;
  [AccountCol.NAME]!: string;
  [AccountCol.ACCOUNT_TYPE]!: string;
  [AccountCol.OPENING_BALANCE]!: number;
  [AccountCol.CURRENCY_NAME]!: string;

  static get tableName(): string {
    return 'Account';
  }
  static get idColumn(): string {
    return 'id';
  }  
}
