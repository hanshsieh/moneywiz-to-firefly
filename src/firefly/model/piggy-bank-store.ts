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
/**
 * 
 * @export
 * @interface PiggyBankStore
 */
export interface PiggyBankStore {
    /**
     * 
     * @type {string}
     * @memberof PiggyBankStore
     */
    name: string;
    /**
     * The ID of the asset account this piggy bank is connected to.
     * @type {string}
     * @memberof PiggyBankStore
     */
    accountId: string;
    /**
     * 
     * @type {string}
     * @memberof PiggyBankStore
     */
    targetAmount: string | null;
    /**
     * 
     * @type {string}
     * @memberof PiggyBankStore
     */
    currentAmount?: string;
    /**
     * The date you started with this piggy bank.
     * @type {string}
     * @memberof PiggyBankStore
     */
    startDate?: string;
    /**
     * The date you intend to finish saving money.
     * @type {string}
     * @memberof PiggyBankStore
     */
    targetDate?: string | null;
    /**
     * 
     * @type {number}
     * @memberof PiggyBankStore
     */
    order?: number;
    /**
     * 
     * @type {boolean}
     * @memberof PiggyBankStore
     */
    active?: boolean;
    /**
     * 
     * @type {string}
     * @memberof PiggyBankStore
     */
    notes?: string | null;
    /**
     * The group ID of the group this object is part of. NULL if no group.
     * @type {string}
     * @memberof PiggyBankStore
     */
    objectGroupId?: string | null;
    /**
     * The name of the group. NULL if no group.
     * @type {string}
     * @memberof PiggyBankStore
     */
    objectGroupTitle?: string | null;
}
