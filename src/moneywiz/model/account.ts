import { Model } from 'objection';
import { AccountGroup, AccountGroupCol } from './account-group';
export enum AccountCol {
  ID = 'id',
  NAME = 'name',
  ACCOUNT_TYPE = 'accountType',
  OPENING_BALANCE = 'openingBalance',
  CURRENCY_NAME = 'currencyName',
  INCLUDE_IN_NETWORTH = 'includeInNetworth',
  GROUP_ID = 'groupId',
}
export class Account extends Model {
  [AccountCol.ID]!: number;
  [AccountCol.NAME]!: string;
  [AccountCol.ACCOUNT_TYPE]!: string;
  [AccountCol.OPENING_BALANCE]!: number;
  [AccountCol.CURRENCY_NAME]!: string;
  [AccountCol.INCLUDE_IN_NETWORTH]!: boolean;
  // The group ID is an INTEGER, but it may exceed the 'number' in JavaScript.
  // Be sure to cast it to string when selecting
  [AccountCol.GROUP_ID]!: string;

  static get tableName(): string {
    return 'Account';
  }
  static get idColumn(): string {
    return 'id';
  }
}
