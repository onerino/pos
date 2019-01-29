import { ISearchResult } from '@cinerino/api-abstract-client/lib/service';
import { factory } from '@cinerino/api-javascript-client';
import { Action } from '@ngrx/store';

/**
 * Action types
 */
export enum ActionTypes {
    Delete = '[Order] Delete',
    Search = '[Order] Search',
    SearchSuccess = '[Order] Search Success',
    SearchFail = '[Order] Search Fail',
    Cancel = '[Order] Cancel',
    CancelSuccess = '[Order] Cancel Success',
    CancelFail = '[Order] Cancel Fail'
}

/**
 * Delete
 */
export class Delete implements Action {
    public readonly type = ActionTypes.Delete;
    constructor(public payload?: {}) { }
}

/**
 * Search
 */
export class Search implements Action {
    public readonly type = ActionTypes.Search;
    constructor(public payload: {
        params: factory.order.ISearchConditions
    }) { }
}

/**
 * SearchSuccess
 */
export class SearchSuccess implements Action {
    public readonly type = ActionTypes.SearchSuccess;
    constructor(public payload: {
        searchResult: ISearchResult<factory.order.IOrder[]>
    }) { }
}

/**
 * SearchFail
 */
export class SearchFail implements Action {
    public readonly type = ActionTypes.SearchFail;
    constructor(public payload: { error: Error }) { }
}

/**
 * Cancel
 */
export class Cancel implements Action {
    public readonly type = ActionTypes.Cancel;
    constructor(public payload: {
        order: factory.order.IOrder
    }) { }
}

/**
 * CancelSuccess
 */
export class CancelSuccess implements Action {
    public readonly type = ActionTypes.CancelSuccess;
    constructor(public payload?: { }) { }
}

/**
 * CancelFail
 */
export class CancelFail implements Action {
    public readonly type = ActionTypes.CancelFail;
    constructor(public payload: { error: Error }) { }
}

/**
 * Actions
 */
export type Actions =
    | Delete
    | Search
    | SearchSuccess
    | SearchFail
    | Cancel
    | CancelSuccess
    | CancelFail;
