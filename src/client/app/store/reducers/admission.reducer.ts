import { factory } from '@cinerino/api-javascript-client';
import { IState } from '.';
import { IDecodeResult } from '../../models';
import { Actions, ActionTypes } from '../actions/admission.action';

export interface IAdmissionState {
    scheduleDate?: string;
    screeningEvent?: factory.chevre.event.screeningEvent.IEvent;
    screeningEventReservations: factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>[];
    qrcodeToken?: {
        token?: string;
        decodeResult?: IDecodeResult;
        availableReservation?: factory.chevre.reservation.event.ISearchConditions;
        checkTokenActions: factory.action.check.token.IAction[];
        statusCode: number;
    };
    // usentList: {
    //     token: string;
    //     decodeResult: IDecodeResult;
    // }[];
}

export const admissionInitialState: IAdmissionState = {
    screeningEventReservations: [],
    // usentList: []
};

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(state: IState, action: Actions): IState {
    switch (action.type) {
        case ActionTypes.Delete: {
            state.admissionData = {
                screeningEventReservations: [],
                // usentList: []
            };
            return { ...state };
        }
        case ActionTypes.SelectScheduleDate: {
            const scheduleDate = action.payload.scheduleDate;
            state.admissionData.scheduleDate = scheduleDate;
            return { ...state, loading: true, process: '', error: null };
        }
        case ActionTypes.SelectSchedule: {
            const screeningEvent = action.payload.screeningEvent;
            state.admissionData.screeningEvent = screeningEvent;
            return { ...state, loading: false, process: '' };
        }
        case ActionTypes.SelectScreeningEvent: {
            const screeningEvent = action.payload.screeningEvent;
            state.admissionData.screeningEvent = screeningEvent;
            return { ...state, loading: false,  process: '', error: null };
        }
        case ActionTypes.GetScreeningEvent: {
            return { ...state };
        }
        case ActionTypes.GetScreeningEventSuccess: {
            const screeningEvent = action.payload.screeningEvent;
            state.admissionData.screeningEvent = screeningEvent;
            return { ...state, error: null };
        }
        case ActionTypes.GetScreeningEventFail: {
            const error = action.payload.error;
            return { ...state, error: JSON.stringify(error) };
        }
        // case ActionTypes.GetScreeningEventReservations: {
        //     return { ...state, loading: true, process: '予約情報を取得しています' };
        // }
        // case ActionTypes.GetScreeningEventReservationsSuccess: {
        //     state.admissionData.screeningEventReservations = action.payload.screeningEventReservations;
        //     return { ...state, loading: false, error: null };
        // }
        // case ActionTypes.GetScreeningEventReservationsFail: {
        //     const error = action.payload.error;
        //     return { ...state, error: JSON.stringify(error) };
        // }
        case ActionTypes.InitializeQrcodeToken: {
            const qrcodeToken = undefined;
            state.admissionData.qrcodeToken = qrcodeToken;
            return { ...state };
        }
        // case ActionTypes.ConvertQrcodeToToken: {
        //     return { ...state, loading: true, process: 'QRコードをトークンへ変換しています', error: null };
        // }
        // case ActionTypes.ConvertQrcodeToTokenSuccess: {
        //     const qrcodeToken = action.payload;
        //     state.admissionData.qrcodeToken = qrcodeToken;
        //     return { ...state, loading: false, process: '', error: null };
        // }
        // case ActionTypes.ConvertQrcodeToTokenFail: {
        //     const error = action.payload.error;
        //     return { ...state, loading: false, process: '', error: JSON.stringify(error) };
        // }
        // case ActionTypes.Admission: {
        //     return { ...state, error: null };
        // }
        // case ActionTypes.AdmissionSuccess: {
        //     const decodeResult = action.payload.decodeResult;
        //     const usentList = state.admissionData.usentList.filter(usent => usent.decodeResult.id !== decodeResult.id);
        //     state.admissionData.usentList = usentList;
        //     return { ...state, error: null };
        // }
        // case ActionTypes.AdmissionFail: {
        //     const error = action.payload.error;
        //     const token = action.payload.token;
        //     const decodeResult = action.payload.decodeResult;
        //     const findResult = state.admissionData.usentList.find(usent => usent.decodeResult.id === decodeResult.id);
        //     if (findResult === undefined) {
        //         state.admissionData.usentList.push({ token, decodeResult });
        //     }

        //     return { ...state, error: JSON.stringify(error) };
        // }
        case ActionTypes.Check: {
            return { ...state, error: null, loading: true, process: 'QRコード情報をを確認しています' };
        }
        case ActionTypes.CheckSuccess: {
            const qrcodeToken = action.payload;
            state.admissionData.qrcodeToken = qrcodeToken;
            return { ...state, loading: false, process: '', error: null };
        }
        case ActionTypes.CheckFail: {
            const error = action.payload.error;

            return { ...state, error: JSON.stringify(error), loading: false, process: '' };
        }
        default: {
            return state;
        }
    }
}
