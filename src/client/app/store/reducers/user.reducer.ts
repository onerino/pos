import { factory } from '@cinerino/api-javascript-client';
import { IState } from '.';
import { environment } from '../../../environments/environment';
import { IPrinter, ViewType } from '../../models';
import { Actions, ActionTypes } from '../actions/user.action';

export interface IUserState {
    seller?: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
    pos?: factory.seller.IPOS;
    customerContact?: factory.transaction.placeOrder.ICustomerContact;
    printer?: IPrinter;
    language: string;
    limitedPurchaseCount: number;
    viewType: ViewType;
}

export const userInitialState: IUserState = {
    language: 'ja',
    limitedPurchaseCount: Number(environment.LIMITED_PURCHASE_COUNT),
    viewType: environment.VIEW_TYPE
};

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(state: IState, action: Actions): IState {
    switch (action.type) {
        case ActionTypes.Delete: {
            return { ...state, loading: false, process: { ja: '', en: '' } };
        }
        case ActionTypes.UpdateAll: {
            const customerContact = action.payload.customerContact;
            const seller = action.payload.seller;
            const pos = action.payload.pos;
            const printer = action.payload.printer;
            const limitedPurchaseCount = action.payload.limitedPurchaseCount;
            const viewType = action.payload.viewType;
            state.userData.customerContact = customerContact;
            state.userData.seller = seller;
            state.userData.pos = pos;
            state.userData.printer = printer;
            state.userData.limitedPurchaseCount = limitedPurchaseCount;
            state.userData.viewType = viewType;

            return { ...state, loading: false, process: { ja: '', en: '' } };
        }
        case ActionTypes.UpdateLanguage: {
            state.userData.language = action.payload.language;
            return { ...state };
        }
        default: {
            return state;
        }
    }
}
