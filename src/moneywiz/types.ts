import Big from 'big.js';
export interface GetTransactionsOpts {
  offset?: number;
  limit?: number;
}

export enum TransactionType {
  TRANSFER_WITHDRAW = 'TransferWithdrawTransaction',
  TRANSFER_DEPOSIT = 'TransferDepositTransaction',
  WITHDRAW = 'WithdrawTransaction',
  DEPOSIT = 'DepositTransaction',
  RECONCILE = 'ReconcilTransaction',
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: Big;
  description: string;
  tags: Tag[];
  payee?: Payee;
  account: Account;
}

export interface TransferWithdrawTransaction extends Transaction {
  type: TransactionType.TRANSFER_WITHDRAW;
  recipientAccount: Account;
}

export interface TransferDepositTransaction extends Transaction {
  type: TransactionType.TRANSFER_DEPOSIT;
  senderAccount: Account;
}

export interface WithdrawTransaction extends Transaction {
  type: TransactionType.WITHDRAW;
}

export interface DepositTransaction extends Transaction {
  type: TransactionType.DEPOSIT;
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
}

export interface Tag {
  id: number;
  name: string;
}
export interface Payee {
  id: number;
  name: string;
}
