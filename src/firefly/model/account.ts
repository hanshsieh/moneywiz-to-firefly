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
import { AccountRoleProperty } from './account-role-property';
import { CreditCardType } from './credit-card-type';
import { LiabilityDirection } from './liability-direction';
import { LiabilityType } from './liability-type';
import { ShortAccountTypeProperty } from './short-account-type-property';
/**
 * 
 * @export
 * @interface Account
 */
export interface Account {
    /**
     * 
     * @type {Date}
     * @memberof Account
     */
    createdAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof Account
     */
    updatedAt?: Date;
    /**
     * If omitted, defaults to true.
     * @type {boolean}
     * @memberof Account
     */
    active?: boolean;
    /**
     * Order of the account. Is NULL if account is not asset or liability.
     * @type {number}
     * @memberof Account
     */
    order?: number | null;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    name: string;
    /**
     * 
     * @type {ShortAccountTypeProperty}
     * @memberof Account
     */
    type: ShortAccountTypeProperty;
    /**
     * 
     * @type {AccountRoleProperty}
     * @memberof Account
     */
    accountRole?: AccountRoleProperty;
    /**
     * Use either currency_id or currency_code. Defaults to the user's default currency.
     * @type {string}
     * @memberof Account
     */
    currencyId?: string;
    /**
     * Use either currency_id or currency_code. Defaults to the user's default currency.
     * @type {string}
     * @memberof Account
     */
    currencyCode?: string;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    currencySymbol?: string;
    /**
     * 
     * @type {number}
     * @memberof Account
     */
    currencyDecimalPlaces?: number;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    currentBalance?: string;
    /**
     * 
     * @type {Date}
     * @memberof Account
     */
    currentBalanceDate?: Date;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    iban?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    bic?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    accountNumber?: string | null;
    /**
     * Represents the opening balance, the initial amount this account holds.
     * @type {string}
     * @memberof Account
     */
    openingBalance?: string;
    /**
     * Represents the current debt for liabilities.
     * @type {string}
     * @memberof Account
     */
    currentDebt?: string | null;
    /**
     * Represents the date of the opening balance.
     * @type {Date}
     * @memberof Account
     */
    openingBalanceDate?: Date | null;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    virtualBalance?: string;
    /**
     * If omitted, defaults to true.
     * @type {boolean}
     * @memberof Account
     */
    includeNetWorth?: boolean;
    /**
     * 
     * @type {CreditCardType}
     * @memberof Account
     */
    creditCardType?: CreditCardType;
    /**
     * Mandatory when the account_role is ccAsset. Moment at which CC payment installments are asked for by the bank.
     * @type {Date}
     * @memberof Account
     */
    monthlyPaymentDate?: Date | null;
    /**
     * 
     * @type {LiabilityType}
     * @memberof Account
     */
    liabilityType?: LiabilityType;
    /**
     * 
     * @type {LiabilityDirection}
     * @memberof Account
     */
    liabilityDirection?: LiabilityDirection;
    /**
     * Mandatory when type is liability. Interest percentage.
     * @type {string}
     * @memberof Account
     */
    interest?: string | null;
    /**
     * 
     * @type {LiabilityDirection}
     * @memberof Account
     */
    interestPeriod?: LiabilityDirection;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    notes?: string | null;
    /**
     * Latitude of the accounts's location, if applicable. Can be used to draw a map.
     * @type {number}
     * @memberof Account
     */
    latitude?: number | null;
    /**
     * Latitude of the accounts's location, if applicable. Can be used to draw a map.
     * @type {number}
     * @memberof Account
     */
    longitude?: number | null;
    /**
     * Zoom level for the map, if drawn. This to set the box right. Unfortunately this is a proprietary value because each map provider has different zoom levels.
     * @type {number}
     * @memberof Account
     */
    zoomLevel?: number | null;
}
