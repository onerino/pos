import { factory } from '@cinerino/api-javascript-client';
import { IState } from '.';
import { reservationAction } from '../actions';

export interface IReservationState {
    reservation?: factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>;
    reservations: factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>[];
    totalCount: number;
    pageCount: number;
}

export const reservationInitialState: IReservationState = {
    reservations: [],
    totalCount: 0,
    pageCount: 1
};

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(state: IState, action: reservationAction.Actions): IState {
    switch (action.type) {
        case reservationAction.ActionTypes.Delete: {
            state.reservationData = {
                reservations: [],
                totalCount: 0,
                pageCount: 1
            };
            return { ...state };
        }
        case reservationAction.ActionTypes.Search: {
            return { ...state, loading: true, process: 'reservationAction.Search' };
        }
        case reservationAction.ActionTypes.SearchSuccess: {
            const searchResult = action.payload.searchResult;
            const limit = action.payload.limit;
            state.reservationData.reservations = searchResult.data;
            state.reservationData.totalCount = searchResult.totalCount;
            state.reservationData.pageCount = Math.ceil(searchResult.totalCount / limit);
            return { ...state, loading: false, process: '', error: null };
        }
        case reservationAction.ActionTypes.SearchFail: {
            const error = action.payload.error;
            return { ...state, loading: false, process: '', error: JSON.stringify(error) };
        }
        default: {
            return state;
        }
    }
}
