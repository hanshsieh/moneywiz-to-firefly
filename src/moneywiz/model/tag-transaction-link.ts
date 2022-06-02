import { Model } from 'objection';
export enum TagTransactionLinkCol {
  ID = 'id',
  TAG_ID = 'tagId',
  TRANSACTION_ID = 'transactionId',
}
export class TagTransactionLink extends Model {
  [TagTransactionLinkCol.ID]!: number;
  [TagTransactionLinkCol.TAG_ID]!: number;
  [TagTransactionLinkCol.TRANSACTION_ID]!: number;

  static get tableName(): string {
    return 'TagTransactionLink';
  }
  static get idColumn(): string {
    return 'id';
  }  
}
