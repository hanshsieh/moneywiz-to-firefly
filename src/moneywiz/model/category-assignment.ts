import { Model } from 'objection';
import { Category, CategoryCol } from './category';
export enum CategoryAssignmentCol {
  ID = 'id',
  TRANSACTION_ID = 'transactionid',
  CATEGORY = 'category',
  AMOUNT = 'amount',
}
export enum CategoryAssignmentRel {
  CATEGORY_INFO = 'categoryInfo',
}
export class CategoryAssignment extends Model {
  [CategoryAssignmentCol.ID]!: number;
  [CategoryAssignmentCol.TRANSACTION_ID]!: string;
  [CategoryAssignmentCol.CATEGORY]!: number;
  [CategoryAssignmentCol.AMOUNT]!: number;
  [CategoryAssignmentRel.CATEGORY_INFO]!: Category;
  static get tableName(): string {
    // There's a typo in the Moneywiz db
    return 'CategoryAssigment';
  }
  static get idColumn(): string {
    return 'id';
  }
  static get relationMappings(){
    return {
      [CategoryAssignmentRel.CATEGORY_INFO]: {
        relation: Model.HasOneRelation,
        modelClass: Category,
        join: {
          from: `${CategoryAssignment.tableName}.${CategoryAssignmentCol.CATEGORY}`,
          to: `${Category.tableName}.${CategoryCol.ID}`,
        }
      },
    };
  }
}
