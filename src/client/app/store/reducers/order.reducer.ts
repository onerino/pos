import { factory } from '@cinerino/api-javascript-client';
import { IState } from '.';
import { Actions, ActionTypes } from '../actions/order.action';

export interface IOrderState {
    order?: factory.order.IOrder;
    orders: factory.order.IOrder[];
    totalCount: number;
    pageCount: number;
}

export const orderInitialState: IOrderState = {
    orders: [],
    totalCount: 0,
    pageCount: 1
};

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(state: IState, action: Actions): IState {
    switch (action.type) {
        case ActionTypes.Delete: {
            state.order = {
                orders: [],
                totalCount: 0,
                pageCount: 1
            };
            return { ...state };
        }
        case ActionTypes.Search: {
            return { ...state, loading: true, process: '検索しています' };
        }
        case ActionTypes.SearchSuccess: {
            const searchResult = action.payload.searchResult;
            state.order.orders = searchResult.data;
            state.order.totalCount = searchResult.totalCount;
            state.order.pageCount = Math.ceil(searchResult.totalCount / searchResult.data.length);
            return { ...state, loading: false, process: '', error: null };
        }
        case ActionTypes.SearchFail: {
            const error = action.payload.error;
            return { ...state, loading: false, process: '', error: JSON.stringify(error) };
        }
        case ActionTypes.Cancel: {
            return { ...state, loading: true, process: '注文を取り消ししています' };
        }
        case ActionTypes.CancelSuccess: {
            return { ...state, loading: false, process: '', error: null };
        }
        case ActionTypes.CancelFail: {
            const error = action.payload.error;
            return { ...state, loading: false, process: '', error: JSON.stringify(error) };
        }
        default: {
            return state;
        }
    }
}
