import { factory } from '@cinerino/api-javascript-client';
import { IState } from '.';
import { Actions, ActionTypes } from '../actions/user.action';

export interface IUserState {
    movieTheater?: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
    pos?: factory.seller.IPOS;
    customerContact?: factory.transaction.placeOrder.ICustomerContact;
    printer?: {
        ipAddress: string;
        id: string;
    };
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
            state.userData.customerContact = customerContact;
            state.userData.movieTheater = movieTheater;
            state.userData.pos = pos;
            state.userData.printer = printer;

            return { ...state, loading: false, process: '' };
        }
        default: {
            return state;
        }
    }
}
