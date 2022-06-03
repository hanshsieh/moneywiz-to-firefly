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
 * @interface InsightTotalEntry
 */
export interface InsightTotalEntry {
    /**
     * The amount spent between start date and end date, defined as a string, for this expense account and all asset accounts.
     * @type {string}
     * @memberof InsightTotalEntry
     */
    difference?: string;
    /**
     * The amount spent between start date and end date, defined as a string, for this expense account and all asset accounts. This number is a float (double) and may have rounding errors.
     * @type {number}
     * @memberof InsightTotalEntry
     */
    differenceFloat?: number;
    /**
     * The currency ID of the expenses listed for this expense account.
     * @type {string}
     * @memberof InsightTotalEntry
     */
    currencyId?: string;
    /**
     * The currency code of the expenses listed for this expense account.
     * @type {string}
     * @memberof InsightTotalEntry
     */
    currencyCode?: string;
}