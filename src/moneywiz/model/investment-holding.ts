import { Model } from 'objection';
export enum InvestmentHoldingCol {
  ID = 'id',
  PRICE_PER_SHARE = 'pricePerShare',
}
export class InvestmentHolding extends Model {
  [InvestmentHoldingCol.ID]!: number;
  [InvestmentHoldingCol.PRICE_PER_SHARE]!: number;

  static get tableName(): string {
    return 'investmentHolding';
  }
  static get idColumn(): string {
    return 'id';
  }  
}
