import { Model } from 'objection';
export enum CategoryCol {
  ID = 'id',
  NAME = 'name',
  PARENT_CATEGORY = 'parentCategory',
  TYPE = 'type',
}
export enum CategoryType {
  EXPENSE = 1,
  INCOME = 2,
}
export enum CategoryRel {
  PARENT_INFO = 'parentInfo',
}

export class Category extends Model {
  [CategoryCol.ID]!: number;
  [CategoryCol.NAME]!: string;
  [CategoryCol.PARENT_CATEGORY]!: number;
  [CategoryCol.TYPE]!: CategoryType;
  [CategoryRel.PARENT_INFO]?: Category;
  static get tableName(): string {
    return 'Category';
  }
  static get idColumn(): string {
    return 'id';
  }
  static get relationMappings(){
    return {
      [CategoryRel.PARENT_INFO]: {
        relation: Model.HasOneRelation,
        modelClass: Category,
        join: {
          from: `${Category.tableName}.${CategoryCol.PARENT_CATEGORY}`,
          to: `${Category.tableName}.${CategoryCol.ID}`,
        }
      },
    };
  }
}
