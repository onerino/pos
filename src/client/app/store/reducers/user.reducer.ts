import { factory } from '@cinerino/api-javascript-client';
import { IState } from '.';
import { environment } from '../../../environments/environment';
import { IPrinter, ViewType } from '../../models';
import { userAction } from '../actions';

export interface IUserState {
    seller?: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
    pos?: factory.seller.IPOS;
    customerContact?: factory.transaction.placeOrder.ICustomerContact;
    printer?: IPrinter;
    language: string;
    purchaseCartMaxLength: number;
    viewType: ViewType;
}

export const userInitialState: IUserState = {
    language: 'ja',
    purchaseCartMaxLength: Number(environment.PURCHASE_CART_MAX_LENGTH),
    viewType: environment.VIEW_TYPE
};

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(state: IState, action: userAction.Actions): IState {
    switch (action.type) {
        case userAction.ActionTypes.Delete: {
            return { ...state, loading: false, process: '' };
        }
        case userAction.ActionTypes.UpdateAll: {
            const customerContact = action.payload.customerContact;
            const seller = action.payload.seller;
            const pos = action.payload.pos;
            const printer = action.payload.printer;
            const purchaseCartMaxLength = action.payload.purchaseCartMaxLength;
            const viewType = action.payload.viewType;
            state.userData.customerContact = customerContact;
            state.userData.seller = seller;
            state.userData.pos = pos;
            state.userData.printer = printer;
            state.userData.purchaseCartMaxLength = purchaseCartMaxLength;
            state.userData.viewType = viewType;

            return { ...state, loading: false, process: '' };
        }
        case userAction.ActionTypes.UpdateLanguage: {
            state.userData.language = action.payload.language;
            return { ...state };
        }
        default: {
            return state;
        }
    }
}
