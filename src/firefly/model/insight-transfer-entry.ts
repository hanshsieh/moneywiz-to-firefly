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
 * @interface InsightTransferEntry
 */
export interface InsightTransferEntry {
    /**
     * This ID is a reference to the original object.
     * @type {string}
     * @memberof InsightTransferEntry
     */
    id?: string;
    /**
     * This is the name of the object.
     * @type {string}
     * @memberof InsightTransferEntry
     */
    name?: string;
    /**
     * The total amount transferred between start date and end date, a number defined as a string, for this asset account.
     * @type {string}
     * @memberof InsightTransferEntry
     */
    difference?: string;
    /**
     * The total amount transferred between start date and end date, a number as a float, for this asset account. May have rounding errors.
     * @type {number}
     * @memberof InsightTransferEntry
     */
    differenceFloat?: number;
    /**
     * The total amount transferred TO this account between start date and end date, a number defined as a string, for this asset account.
     * @type {string}
     * @memberof InsightTransferEntry
     */
    _in?: string;
    /**
     * The total amount transferred FROM this account between start date and end date, a number as a float, for this asset account. May have rounding errors.
     * @type {number}
     * @memberof InsightTransferEntry
     */
    inFloat?: number;
    /**
     * The total amount transferred FROM this account between start date and end date, a number defined as a string, for this asset account.
     * @type {string}
     * @memberof InsightTransferEntry
     */
    out?: string;
    /**
     * The total amount transferred TO this account between start date and end date, a number as a float, for this asset account. May have rounding errors.
     * @type {number}
     * @memberof InsightTransferEntry
     */
    outFloat?: number;
    /**
     * The currency ID of the expenses listed for this account.
     * @type {string}
     * @memberof InsightTransferEntry
     */
    currencyId?: string;
    /**
     * The currency code of the expenses listed for this account.
     * @type {string}
     * @memberof InsightTransferEntry
     */
    currencyCode?: string;
}