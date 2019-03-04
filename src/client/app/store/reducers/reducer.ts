import { environment } from '../../../environments/environment';
import { ILanguage, Reservation } from '../../models';
import * as admissionAction from '../actions/admission.action';
import * as masterAction from '../actions/master.action';
import * as orderAction from '../actions/order.action';
import * as purchaseAction from '../actions/purchase.action';
import * as userAction from '../actions/user.action';
import * as admissionReducer from './admission.reducer';
import * as masterReducer from './master.reducer';
import * as orderReducer from './order.reducer';
import * as purchaseReducer from './purchase.reducer';
import * as userReducer from './user.reducer';

/**
 * State
 */
export interface IState {
    loading: boolean;
    process: ILanguage;
    error: string | null;
    purchaseData: purchaseReducer.IPurchaseState;
    userData: userReducer.IUserState;
    masterData: masterReducer.IMasterState;
    admissionData: admissionReducer.IAdmissionState;
    orderData: orderReducer.IOrderState;
}

/**
 * Initial state
 */
export const initialState: IState = {
    loading: false,
    process: { ja: '', en: '' },
    error: null,
    purchaseData: purchaseReducer.purchaseInitialState,
    userData: userReducer.userInitialState,
    masterData: masterReducer.masterInitialState,
    admissionData: admissionReducer.admissionInitialState,
    orderData: orderReducer.orderInitialState
};

function getInitialState(): IState {
    const json = localStorage.getItem(environment.STORAGE_NAME);
    if (json === undefined || json === null) {
        return initialState;
    }
    const tmpData: { App: IState } = JSON.parse(json);
    const data = { ...initialState, ...tmpData.App };
    data.userData.language = (data.userData.language === undefined)
        ? userReducer.userInitialState.language
        : data.userData.language;
    const reservations = data.purchaseData.reservations.map((reservation: Reservation) => new Reservation(reservation));
    data.purchaseData.reservations = reservations;

    return data;
}

type Actions =
    purchaseAction.Actions
    | userAction.Actions
    | masterAction.Actions
    | admissionAction.Actions
    | orderAction.Actions;

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(
    state = getInitialState(),
    action: Actions
): IState {
    if (/\[Purchase\]/.test(action.type)) {
        return purchaseReducer.reducer(state, <purchaseAction.Actions>action);
    } else if (/\[User\]/.test(action.type)) {
        return userReducer.reducer(state, <userAction.Actions>action);
    } else if (/\[Master\]/.test(action.type)) {
        return masterReducer.reducer(state, <masterAction.Actions>action);
    } else if (/\[Admission\]/.test(action.type)) {
        return admissionReducer.reducer(state, <admissionAction.Actions>action);
    } else if (/\[Order\]/.test(action.type)) {
        return orderReducer.reducer(state, <orderAction.Actions>action);
    } else {
        return state;
    }
}

/**
 * Selectors
 */
export const getLoading = (state: IState) => state.loading;
export const getProcess = (state: IState) => state.process;
export const getError = (state: IState) => state.error;
export const getPurchase = (state: IState) => state.purchaseData;
export const getUser = (state: IState) => state.userData;
export const getMaster = (state: IState) => state.masterData;
export const getAdmission = (state: IState) => state.admissionData;
export const getOrder = (state: IState) => state.orderData;
