import { factory } from '@cinerino/api-javascript-client';
import { IState } from '.';
import { IDecodeResult } from '../../models';
import { admissionAction } from '../actions';

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
}

export const admissionInitialState: IAdmissionState = {
    screeningEventReservations: []
};

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(state: IState, action: admissionAction.Actions): IState {
    switch (action.type) {
        case admissionAction.ActionTypes.Delete: {
            state.admissionData = {
                screeningEventReservations: []
            };
            return { ...state };
        }
        case admissionAction.ActionTypes.SelectScheduleDate: {
            const scheduleDate = action.payload.scheduleDate;
            state.admissionData.scheduleDate = scheduleDate;
            return { ...state, loading: true, process: '', error: null };
        }
        case admissionAction.ActionTypes.SelectSchedule: {
            const screeningEvent = action.payload.screeningEvent;
            state.admissionData.screeningEvent = screeningEvent;
            return { ...state, loading: false, process: '' };
        }
        case admissionAction.ActionTypes.SelectScreeningEvent: {
            const screeningEvent = action.payload.screeningEvent;
            state.admissionData.screeningEvent = screeningEvent;
            return { ...state, loading: false,  process: '', error: null };
        }
        case admissionAction.ActionTypes.GetScreeningEvent: {
            return { ...state };
        }
        case admissionAction.ActionTypes.GetScreeningEventSuccess: {
            const screeningEvent = action.payload.screeningEvent;
            state.admissionData.screeningEvent = screeningEvent;
            return { ...state, error: null };
        }
        case admissionAction.ActionTypes.GetScreeningEventFail: {
            const error = action.payload.error;
            return { ...state, error: JSON.stringify(error) };
        }
        case admissionAction.ActionTypes.InitializeQrcodeToken: {
            const qrcodeToken = undefined;
            state.admissionData.qrcodeToken = qrcodeToken;
            return { ...state };
        }
        case admissionAction.ActionTypes.Check: {
            return { ...state, error: null, loading: true, process: 'admissionAction.Check' };
        }
        case admissionAction.ActionTypes.CheckSuccess: {
            const qrcodeToken = action.payload;
            state.admissionData.qrcodeToken = qrcodeToken;
            return { ...state, loading: false, process: '', error: null };
        }
        case admissionAction.ActionTypes.CheckFail: {
            const error = action.payload.error;

            return { ...state, error: JSON.stringify(error), loading: false, process: '' };
        }
        default: {
            return state;
        }
    }
}
