import { Account } from "./account";

/**
 * 
 * @export
 * @interface AccountRead
 */
export interface AccountRead {
    /**
     * Immutable value
     */
    type: string;
    id: string;
    attributes: Account;
}
