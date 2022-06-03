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
 * @interface PiggyBankUpdate
 */
export interface PiggyBankUpdate {
    /**
     * 
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    name?: string;
    /**
     * The ID of the asset account this piggy bank is connected to.
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    accountId?: string;
    /**
     * 
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    currencyId?: string;
    /**
     * 
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    currencyCode?: string;
    /**
     * 
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    targetAmount?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    currentAmount?: string;
    /**
     * The date you started with this piggy bank.
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    startDate?: string;
    /**
     * The date you intend to finish saving money.
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    targetDate?: string | null;
    /**
     * 
     * @type {number}
     * @memberof PiggyBankUpdate
     */
    order?: number;
    /**
     * 
     * @type {boolean}
     * @memberof PiggyBankUpdate
     */
    active?: boolean;
    /**
     * 
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    notes?: string | null;
    /**
     * The group ID of the group this object is part of. NULL if no group.
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    objectGroupId?: string | null;
    /**
     * The name of the group. NULL if no group.
     * @type {string}
     * @memberof PiggyBankUpdate
     */
    objectGroupTitle?: string | null;
}