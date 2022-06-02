import { Model } from 'objection';
export enum TagCol {
  ID = 'id',
  NAME = 'name',
}
export class Tag extends Model {
  [TagCol.ID]!: number;
  [TagCol.NAME]!: string;

  static get tableName(): string {
    return 'Tag';
  }
  static get idColumn(): string {
    return 'id';
  }  
}
