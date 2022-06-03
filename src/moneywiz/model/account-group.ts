import { Model } from 'objection';
export enum AccountGroupCol {
  ID = 'id',
  NAME = 'name',
}
export class AccountGroup extends Model {
  [AccountGroupCol.ID]!: number;
  [AccountGroupCol.NAME]!: string;

  static get tableName(): string {
    return 'AccountGroup';
  }
  static get idColumn(): string {
    return 'id';
  }  
}
