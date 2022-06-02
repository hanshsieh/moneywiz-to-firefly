import { Model } from 'objection';
export enum PayeeCol {
  ID = 'id',
  NAME = 'name',
}
export class Payee extends Model {
  [PayeeCol.ID]!: number;
  [PayeeCol.NAME]!: string;

  static get tableName(): string {
    return 'Payee';
  }
  static get idColumn(): string {
    return 'id';
  }  
}
