import { factory } from '@cinerino/api-javascript-client';
import { Action } from '@ngrx/store';
import { IPrinter, ViewType } from '../../models';

/**
 * Action types
 */
export enum ActionTypes {
    Delete = '[User] Delete',
    UpdateAll = '[User] Update All',
    UpdateLanguage = '[User] Update Language',
}

/**
 * Delete
 */
export class Delete implements Action {
    public readonly type = ActionTypes.Delete;
    constructor(public payload?: {}) { }
}

/**
 * UpdateAll
 */
export class UpdateAll implements Action {
    public readonly type = ActionTypes.UpdateAll;
    constructor(public payload: {
        seller: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
        pos: factory.seller.IPOS;
        customerContact: factory.transaction.placeOrder.ICustomerContact;
        printer: IPrinter;
        purchaseCartMaxLength: number;
        viewType: ViewType;
    }) { }
}


/**
 * UpdateLanguage
 */
export class UpdateLanguage implements Action {
    public readonly type = ActionTypes.UpdateLanguage;
    constructor(public payload: { language: string }) { }
}

/**
 * Actions
 */
export type Actions =
    | Delete
    | UpdateAll
    | UpdateLanguage;
