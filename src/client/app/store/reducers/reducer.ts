import { Reservation } from '../../models';
import * as admissionAction from '../actions/admission.action';
import * as inquiryAction from '../actions/inquiry.action';
import * as masterAction from '../actions/master.action';
import * as orderAction from '../actions/order.action';
import * as purchaseAction from '../actions/purchase.action';
import * as userAction from '../actions/user.action';
import * as admissionReducer from './admission.reducer';
import * as inquiryReducer from './inquiry.reducer';
import * as masterReducer from './master.reducer';
import * as orderReducer from './order.reducer';
import * as purchaseReducer from './purchase.reducer';
import * as userReducer from './user.reducer';

/**
 * State
 */
export interface IState {
    loading: boolean;
    process: string;
    error: string | null;
    purchase: purchaseReducer.IPurchaseState;
    inquiry: inquiryReducer.IInquiryState;
    user: userReducer.IUserState;
    master: masterReducer.IMasterState;
    admission: admissionReducer.IAdmissionState;
    order: orderReducer.IOrderState;
}

/**
 * Initial state
 */
export const initialState: IState = {
    loading: false,
    process: '',
    error: null,
    purchase: purchaseReducer.purchaseInitialState,
    inquiry: inquiryReducer.inquiryInitialState,
    user: userReducer.userInitialState,
    master: masterReducer.masterInitialState,
    admission: admissionReducer.admissionInitialState,
    order: orderReducer.orderInitialState
};

function getInitialState(): IState {
    const json = localStorage.getItem('state');
    if (json === undefined || json === null) {
        return initialState;
    }
    const data: { App: IState } = JSON.parse(json);
    const reservations = data.App.purchase.reservations.map((reservation: Reservation) => new Reservation(reservation));
    data.App.purchase.reservations = reservations;

    return { ...initialState, ...data.App };
}

type Actions =
    purchaseAction.Actions
    | userAction.Actions
    | inquiryAction.Actions
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
    } else if (/\[Inquiry\]/.test(action.type)) {
        return inquiryReducer.reducer(state, <inquiryAction.Actions>action);
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
export const getPurchase = (state: IState) => state.purchase;
export const getInquiry = (state: IState) => state.inquiry;
export const getUser = (state: IState) => state.user;
export const getMaster = (state: IState) => state.master;
export const getAdmission = (state: IState) => state.admission;
export const getOrder = (state: IState) => state.order;
