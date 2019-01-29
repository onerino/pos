import { factory } from '@cinerino/api-javascript-client';
import { IState } from '.';
import { Actions, ActionTypes } from '../actions/user.action';

export interface IUserState {
    movieTheater?: factory.organization.IOrganization<factory.organizationType.MovieTheater>;
    pos?: factory.organization.IPOS;
    customerContact?: factory.transaction.placeOrder.ICustomerContact;
    printer?: { ipAddress: string; };
}

export const userInitialState: IUserState = {};

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(state: IState, action: Actions): IState {
    switch (action.type) {
        case ActionTypes.Delete: {
            return { ...state, loading: false, process: '' };
        }
        case ActionTypes.UpdateAll: {
            const customerContact = action.payload.customerContact;
            const movieTheater = action.payload.movieTheater;
            const pos = action.payload.pos;
            const printer = action.payload.printer;
            state.user.customerContact = customerContact;
            state.user.movieTheater = movieTheater;
            state.user.pos = pos;
            state.user.printer = printer;

            return { ...state, loading: false, process: '' };
        }
        default: {
            return state;
        }
    }
}
