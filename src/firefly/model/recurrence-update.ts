/* tslint:disable */
/* eslint-disable */
/**
 * Firefly III API v1.5.6
 * This is the documentation of the Firefly III API. You can find accompanying documentation on the website of Firefly III itself (see below). Please report any bugs or issues. You may use the \"Authorize\" button to try the API below. This file was last generated on 2022-04-04T03:54:41+00:00 
 *
 * OpenAPI spec version: 1.5.6
 * Contact: james@firefly-iii.org
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { RecurrenceRepetitionUpdate } from './recurrence-repetition-update';
import { RecurrenceTransactionUpdate } from './recurrence-transaction-update';
/**
 * 
 * @export
 * @interface RecurrenceUpdate
 */
export interface RecurrenceUpdate {
    /**
     * 
     * @type {string}
     * @memberof RecurrenceUpdate
     */
    title?: string;
    /**
     * Not to be confused with the description of the actual transaction(s) being created.
     * @type {string}
     * @memberof RecurrenceUpdate
     */
    description?: string;
    /**
     * First time the recurring transaction will fire.
     * @type {string}
     * @memberof RecurrenceUpdate
     */
    firstDate?: string;
    /**
     * Date until the recurring transaction can fire. After that date, it's basically inactive. Use either this field or repetitions.
     * @type {string}
     * @memberof RecurrenceUpdate
     */
    repeatUntil?: string | null;
    /**
     * Max number of created transactions. Use either this field or repeat_until.
     * @type {number}
     * @memberof RecurrenceUpdate
     */
    nrOfRepetitions?: number | null;
    /**
     * Whether or not to fire the rules after the creation of a transaction.
     * @type {boolean}
     * @memberof RecurrenceUpdate
     */
    applyRules?: boolean;
    /**
     * If the recurrence is even active.
     * @type {boolean}
     * @memberof RecurrenceUpdate
     */
    active?: boolean;
    /**
     * 
     * @type {string}
     * @memberof RecurrenceUpdate
     */
    notes?: string | null;
    /**
     * 
     * @type {Array<RecurrenceRepetitionUpdate>}
     * @memberof RecurrenceUpdate
     */
    repetitions?: Array<RecurrenceRepetitionUpdate>;
    /**
     * 
     * @type {Array<RecurrenceTransactionUpdate>}
     * @memberof RecurrenceUpdate
     */
    transactions?: Array<RecurrenceTransactionUpdate>;
}
