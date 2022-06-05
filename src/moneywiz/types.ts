import Big from 'big.js';
export interface GetTransactionsOpts {
  offset?: number;
  limit?: number;
}

export interface GetAccountsOpts {
  offset?: number;
  limit?: number;
}

export interface GetCategoriesOpts {
  offset?: number;
  limit?: number;
}

export enum TransactionType {
  TRANSFER_WITHDRAW = 'TransferWithdrawTransaction',
  TRANSFER_DEPOSIT = 'TransferDepositTransaction',
  WITHDRAW = 'WithdrawTransaction',
  DEPOSIT = 'DepositTransaction',
  RECONCILE = 'ReconcileTransaction',
  REFUND = 'RefundTransaction',
  INVESTMENT_BUY = 'InvestmentBuyTransaction',
  INVESTMENT_SELL = 'InvestmentSellTransaction',
  INVESTMENT_EXCHANGE = 'InvestmentExchangeTransaction',
}

export interface Transaction extends BaseTransaction {
  date: Date;
  description: string;
  tags: Tag[];
  payee?: Payee;
  account: Account;
  desc: string;
  notes: string;
  categories: CategoryAssign[],
  recipientAccount?: Account;
  senderAccount?: Account;
  recipientTransaction?: BaseTransaction;
  senderTransaction?: BaseTransaction;
}

export interface InvestmentHolding {
  id: number;
  pricePerShare: Big;
}

export interface BaseTransaction {
  id: number;
  type: TransactionType;
  amount: Big;
  numberOfShares?: Big;
  investmentHolding?: InvestmentHolding;
}

export interface CategoryAssign {
  id: number;
  amount: Big;
  category: Category;
}

export interface Category {
  id: number;
  name: string;
  parent?: Category;
}

export enum AccountType {
  BANK_CHECK = 'BankChequeAccount',
  CASH = 'CashAccount',
  CREDIT_CARD = 'CreditCardAccount',
  BANK_SAVING = 'BankSavingAccount',
  INVESTMENT = 'InvestmentAccount',
  FOREX = 'ForexAccount',
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  openingBalance: Big;
  currency: string;
  includeInNetworth: boolean;
  groupName?: string;
}

export interface Tag {
  id: number;
  name: string;
}
export interface Payee {
  id: number;
  name: string;
}
