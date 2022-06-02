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
 * @interface CurrencyUpdate
 */
export interface CurrencyUpdate {
    /**
     * If the currency is enabled
     * @type {boolean}
     * @memberof CurrencyUpdate
     */
    enabled?: boolean;
    /**
     * If the currency must be the default for the user. You can only submit TRUE.
     * @type {boolean}
     * @memberof CurrencyUpdate
     */
    _default?: boolean;
    /**
     * The currency code
     * @type {string}
     * @memberof CurrencyUpdate
     */
    code?: string;
    /**
     * The currency name
     * @type {string}
     * @memberof CurrencyUpdate
     */
    name?: string;
    /**
     * The currency symbol
     * @type {string}
     * @memberof CurrencyUpdate
     */
    symbol?: string;
    /**
     * How many decimals to use when displaying this currency. Between 0 and 16.
     * @type {number}
     * @memberof CurrencyUpdate
     */
    decimalPlaces?: number;
}
