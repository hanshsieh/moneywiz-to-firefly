import { Model } from 'objection';
import { Account, AccountCol } from './account';
import { CategoryAssignment, CategoryAssignmentCol } from './category-assignment';
import { InvestmentHolding, InvestmentHoldingCol } from './investment-holding';
import { Payee, PayeeCol } from './payee';
import { Tag, TagCol } from './tag';
import { TagTransactionLink, TagTransactionLinkCol } from './tag-transaction-link';
export enum TransactionCol {
  ID = 'id',
  TRANSACTION_TYPE = 'transactionType',
  DESC = 'desc',
  AMOUNT = 'amount',
  DATE = 'date',
  FEE = 'fee',
  NOTES = 'notes',
  RECONCILED = 'reconciled',
  ACCOUNT = 'account',
  RECIPIENT_ACCOUNT = 'recipientAccount',
  SENDER_ACCOUNT = 'senderAccount',
  RECIPIENT_TRANSACTION = 'recipientTransaction',
  SENDER_TRANSACTION = 'senderTransaction',
  PAYEE_ID = 'payee',
  ORIGINAL_RECIPIENT_CURRENCY = 'originalRecipientCurrency',
  ORIGINAL_RECIPIENT_AMOUNT = 'originalRecipientAmount',
  ORIGINAL_SENDER_CURRENCY = 'originalSenderCurrency',
  ORIGINAL_SENDER_AMOUNT = 'originalSenderAmount',
  NUMBER_OF_SHARES = 'numberOfShares',
  INVESTMENT_HOLDING_ID = 'investmentHoldingId',
}
export enum TransactionRel {
  TAGS = 'tags',
  PAYEE_INFO = 'payeeInfo',
  ACCOUNT_INFO = 'accountInfo',
  RECIPIENT_INFO = 'recipientInfo',
  SENDER_INFO = 'senderInfo',
  RECIPIENT_TRANSACTION_INFO = 'recipientTransactionInfo',
  SENDER_TRANSACTION_INFO = 'senderTransactionInfo',
  CATEGORY_ASSIGNS = 'categoryAssigns',
  INVESTMENT_HOLDING = 'investmentHolding',
}
export class Transaction extends Model {
  [TransactionCol.ID]!: number;
  /**
   * It can be
   * - "TransferWithdrawTransaction"
   *   This is a transfer. There will be two transactions and this is the withdrawal side.
   * - "TransferDepositTransaction"
   *   This is a transfer. There will be two transactions and this is the deposit side.
   * - "WithdrawTransaction"
   *   This is a withdrawal transaction.
   * - "DepositTransaction"
   *   This is the disposit transaction.
   * - "ReconcilTransaction":
   *   This transaction reconcile the new balance.
   */
  [TransactionCol.TRANSACTION_TYPE]!: string;
  [TransactionCol.DESC]!: string;
  [TransactionCol.AMOUNT]!: number;
  /**
   * The creation time of the transaction in milliseconds since epoch.
   */
  [TransactionCol.DATE]!: number;
  [TransactionCol.FEE]!: number;
  [TransactionCol.NOTES]!: string;
  [TransactionCol.RECONCILED]!: boolean;
  /**
   * Account ID.
   * If the "transactionType" is "TransferWithdrawTransaction", it is the "sender" account".
   * If the "transactionType" is "TransferDepositTransaction", it is the "recipient" account".
   */
  [TransactionCol.ACCOUNT]!: number;
  /**
   * If "transactionType" is "TransferWithdrawTransaction", it is the "recipient" account".
   * Otherwise, it's 0.
   */
  [TransactionCol.RECIPIENT_ACCOUNT]!: number;
  /**
   * If "transactionType" is "TransferDepositTransaction", it is the "sender" account".
   * Otherwise, it's 0.
   */
  [TransactionCol.SENDER_ACCOUNT]!: number;
  [TransactionCol.PAYEE_ID]!: number;
  [TransactionCol.ORIGINAL_RECIPIENT_CURRENCY]!: string;
  [TransactionCol.ORIGINAL_RECIPIENT_AMOUNT]!: number;
  [TransactionCol.ORIGINAL_SENDER_CURRENCY]!: string;
  [TransactionCol.ORIGINAL_SENDER_AMOUNT]!: number;
  [TransactionCol.NUMBER_OF_SHARES]!: number;

  [TransactionRel.TAGS]!: Tag[];
  [TransactionRel.PAYEE_INFO]!: Payee;
  [TransactionRel.ACCOUNT_INFO]!: Account;
  [TransactionRel.RECIPIENT_INFO]!: Account;
  [TransactionRel.SENDER_INFO]!: Account;
  [TransactionRel.CATEGORY_ASSIGNS]!: CategoryAssignment[];
  [TransactionRel.RECIPIENT_TRANSACTION_INFO]!: Transaction;
  [TransactionRel.SENDER_TRANSACTION_INFO]!: Transaction;
  [TransactionRel.INVESTMENT_HOLDING]!: InvestmentHolding;

  static get tableName(): string {
    return 'Transactions';
  }
  static get idColumn(): string {
    return 'id';
  }
  static get relationMappings(){
    return {
      [TransactionRel.TAGS]: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.ID}`,
          through: {
            from: `${TagTransactionLink.tableName}.${TagTransactionLinkCol.TRANSACTION_ID}`,
            to: `${TagTransactionLink.tableName}.${TagTransactionLinkCol.TAG_ID}`,
          },
          to: `${Tag.tableName}.${TagCol.ID}`,
        }
      },
      [TransactionRel.PAYEE_INFO]: {
        relation: Model.HasOneRelation,
        modelClass: Payee,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.PAYEE_ID}`,
          to: `${Payee.tableName}.${PayeeCol.ID}`,
        }
      },
      [TransactionRel.ACCOUNT_INFO]: {
        relation: Model.HasOneRelation,
        modelClass: Account,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.ACCOUNT}`,
          to: `${Account.tableName}.${AccountCol.ID}`,
        }
      },
      [TransactionRel.RECIPIENT_INFO]: {
        relation: Model.HasOneRelation,
        modelClass: Account,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.RECIPIENT_ACCOUNT}`,
          to: `${Account.tableName}.${AccountCol.ID}`,
        }
      },
      [TransactionRel.SENDER_INFO]: {
        relation: Model.HasOneRelation,
        modelClass: Account,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.SENDER_ACCOUNT}`,
          to: `${Account.tableName}.${AccountCol.ID}`,
        }
      },
      [TransactionRel.RECIPIENT_TRANSACTION_INFO]: {
        relation: Model.HasOneRelation,
        modelClass: Transaction,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.RECIPIENT_TRANSACTION}`,
          to: `${Transaction.tableName}.${TransactionCol.ID}`,
        }
      },
      [TransactionRel.SENDER_TRANSACTION_INFO]: {
        relation: Model.HasOneRelation,
        modelClass: Transaction,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.SENDER_TRANSACTION}`,
          to: `${Transaction.tableName}.${TransactionCol.ID}`,
        }
      },
      [TransactionRel.CATEGORY_ASSIGNS]: {
        relation: Model.HasManyRelation,
        modelClass: CategoryAssignment,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.ID}`,
          to: `${CategoryAssignment.tableName}.${CategoryAssignmentCol.TRANSACTION_ID}`,
        }
      },
      [TransactionRel.INVESTMENT_HOLDING]: {
        relation: Model.HasOneRelation,
        modelClass: InvestmentHolding,
        join: {
          from: `${Transaction.tableName}.${TransactionCol.INVESTMENT_HOLDING_ID}`,
          to: `${InvestmentHolding.tableName}.${InvestmentHoldingCol.ID}`,
        }
      },
    };
  }
}
