import { factory } from '@cinerino/api-javascript-client';
import { Action } from '@ngrx/store';

/**
 * Action types
 */
export enum ActionTypes {
    Delete = '[User] Delete',
    UpdateAll = '[User] Update All'
}

/**
 * Delete
 */
export class Delete implements Action {
    public readonly type = ActionTypes.Delete;
    constructor(public payload?: {}) { }
}

/**
 * Update
 */
export class UpdateAll implements Action {
    public readonly type = ActionTypes.UpdateAll;
    constructor(public payload: {
        movieTheater: factory.organization.IOrganization<factory.organizationType.MovieTheater>;
        pos: any;
        customerContact: factory.transaction.placeOrder.ICustomerContact;
        printer: { ipAddress: string; };
    }) { }
}

/**
 * Actions
 */
export type Actions =
    | Delete
    | UpdateAll;
