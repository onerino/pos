import { ISearchResult } from '@cinerino/api-abstract-client/lib/service';
import { factory } from '@cinerino/api-javascript-client';
import { Action } from '@ngrx/store';

/**
 * Action types
 */
export enum ActionTypes {
    Delete = '[Reservation] Delete',
    Search = '[Reservation] Search',
    SearchSuccess = '[Reservation] Search Success',
    SearchFail = '[Reservation] Search Fail',
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
        params: factory.chevre.reservation.ISearchConditions<factory.chevre.reservationType.EventReservation>
    }) { }
}

/**
 * SearchSuccess
 */
export class SearchSuccess implements Action {
    public readonly type = ActionTypes.SearchSuccess;
    constructor(public payload: {
        searchResult: ISearchResult<factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>[]>,
        limit: number;
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
 * Actions
 */
export type Actions =
    | Delete
    | Search
    | SearchSuccess
    | SearchFail;
