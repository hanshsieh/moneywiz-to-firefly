import Big from 'big.js';
export interface GetTransactionsOpts {
  offset?: number;
  limit?: number;
}

export interface GetAccountsOpts {
  offset?: number;
  limit?: number;
}

export interface GetCategoriessOpts {
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

export interface Transaction {
  id: number;
  type: TransactionType;
  date: Date;
  amount: Big;
  recipientAmount?: Big;
  senderAmount?: Big;
  description: string;
  tags: Tag[];
  payee?: Payee;
  account: Account;
  desc: string;
  notes: string;
  categories: CategoryAssign[],
  recipientAccount?: Account;
  senderAccount?: Account;
}

export interface CategoryAssign {
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
  group?: AccountGroup;
}

export interface AccountGroup {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}
export interface Payee {
  id: number;
  name: string;
}
