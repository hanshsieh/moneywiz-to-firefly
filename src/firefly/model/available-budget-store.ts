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
 * @interface AvailableBudgetStore
 */
export interface AvailableBudgetStore {
    /**
     * Use either currency_id or currency_code.
     * @type {string}
     * @memberof AvailableBudgetStore
     */
    currencyId?: string;
    /**
     * Use either currency_id or currency_code.
     * @type {string}
     * @memberof AvailableBudgetStore
     */
    currencyCode?: string;
    /**
     * 
     * @type {string}
     * @memberof AvailableBudgetStore
     */
    amount: string;
    /**
     * Start date of the available budget.
     * @type {string}
     * @memberof AvailableBudgetStore
     */
    start: string;
    /**
     * End date of the available budget.
     * @type {string}
     * @memberof AvailableBudgetStore
     */
    end: string;
}