
import { factory } from '@cinerino/api-javascript-client';
import { Action } from '@ngrx/store';
import { IDecodeResult } from '../../models';

/**
 * Action types
 */
export enum ActionTypes {
    Delete = '[Admission] Delete',
    SelectSchedule = '[Admission] Select Schedule',
    SelectScheduleDate = '[Admission] Select Schedule Date',
    SelectScreeningEvent = '[Admission] Select Screening Event',
    GetScreeningEvent = '[User] Get Screening Event',
    GetScreeningEventSuccess = '[User] Get Screening Event Success',
    GetScreeningEventFail = '[User] Get Screening Event Fail',
    GetScreeningEventReservations = '[Admission] Get Screening Reservations',
    GetScreeningEventReservationsSuccess = '[Admission] Get Screening Events Reservations Success',
    GetScreeningEventReservationsFail = '[Admission] Get Screening Events Reservations Fail',
    InitializeQrcodeToken = '[Admission] Initialize Qrcode Token',
    InitializeUsentList = '[Admission] Initialize Usent List',
    ConvertQrcodeToToken = '[Admission] Convert Qrcode To Token',
    ConvertQrcodeToTokenSuccess = '[Admission] Convert Qrcode To Token Success',
    ConvertQrcodeToTokenFail = '[Admission] Convert Qrcode To Token Fail',
    Admission = '[Admission] Admission',
    AdmissionSuccess = '[Admission] Admission Success',
    AdmissionFail = '[Admission] Admission Fail'
}

/**
 * Delete
 */
export class Delete implements Action {
    public readonly type = ActionTypes.Delete;
    constructor(public payload: {}) { }
}

/**
 * SelectSchedule
 */
export class SelectSchedule implements Action {
    public readonly type = ActionTypes.SelectSchedule;
    constructor(public payload: { screeningEvent: factory.chevre.event.screeningEvent.IEvent }) { }
}

/**
 * SelectScheduleDate
 */
export class SelectScheduleDate implements Action {
    public readonly type = ActionTypes.SelectScheduleDate;
    constructor(public payload: { scheduleDate: string }) { }
}

/**
 * SelectScreeningEvent
 */
export class SelectScreeningEvent implements Action {
    public readonly type = ActionTypes.SelectScreeningEvent;
    constructor(public payload: { screeningEvent: factory.chevre.event.screeningEvent.IEvent }) { }
}

/**
 * GetScreeningEvent
 */
export class GetScreeningEvent implements Action {
    public readonly type = ActionTypes.GetScreeningEvent;
    constructor(public payload: { params: { id: string; } }) { }
}

/**
 * GetScreeningEventSuccess
 */
export class GetScreeningEventSuccess implements Action {
    public readonly type = ActionTypes.GetScreeningEventSuccess;
    constructor(public payload: { screeningEvent: factory.chevre.event.screeningEvent.IEvent }) { }
}

/**
 * GetScreeningEventFail
 */
export class GetScreeningEventFail implements Action {
    public readonly type = ActionTypes.GetScreeningEventFail;
    constructor(public payload: { error: Error }) { }
}

/**
 * GetScreeningEventReservations
 */
export class GetScreeningEventReservations implements Action {
    public readonly type = ActionTypes.GetScreeningEventReservations;
    constructor(public payload: { params: factory.chevre.reservation.event.ISearchConditions }) { }
}

/**
 * GetScreeningEventReservationsSuccess
 */
export class GetScreeningEventReservationsSuccess implements Action {
    public readonly type = ActionTypes.GetScreeningEventReservationsSuccess;
    constructor(public payload: {
        screeningEventReservations: factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>[]
    }) { }
}

/**
 * GetScreeningEventReservationsFail
 */
export class GetScreeningEventReservationsFail implements Action {
    public readonly type = ActionTypes.GetScreeningEventReservationsFail;
    constructor(public payload: { error: Error }) { }
}

/**
 * InitializeQrcodeToken
 */
export class InitializeQrcodeToken implements Action {
    public readonly type = ActionTypes.InitializeQrcodeToken;
    constructor(public payload?: {}) { }
}

/**
 * InitializeUsentList
 */
export class InitializeUsentList implements Action {
    public readonly type = ActionTypes.InitializeUsentList;
    constructor(public payload?: {}) { }
}

/**
 * ConvertQrcodeToToken
 */
export class ConvertQrcodeToToken implements Action {
    public readonly type = ActionTypes.ConvertQrcodeToToken;
    constructor(public payload: {
        params: {
            code: string;
            screeningEventReservations: factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>[];
        }
    }) { }
}

/**
 * ConvertQrcodeToTokenSuccess
 */
export class ConvertQrcodeToTokenSuccess implements Action {
    public readonly type = ActionTypes.ConvertQrcodeToTokenSuccess;
    constructor(public payload: {
        token?: string;
        decodeResult?: IDecodeResult;
        availableReservation?: factory.chevre.reservation.event.ISearchConditions;
        checkTokenActions: factory.action.check.token.IAction[];
        isAvailable: boolean;
        statusCode: number;
    }) { }
}

/**
 * ConvertQrcodeToTokenFail
 */
export class ConvertQrcodeToTokenFail implements Action {
    public readonly type = ActionTypes.ConvertQrcodeToTokenFail;
    constructor(public payload: { error: Error }) { }
}


/**
 * Admission
 */
export class Admission implements Action {
    public readonly type = ActionTypes.Admission;
    constructor(public payload: { token: string; decodeResult: IDecodeResult }) { }
}

/**
 * AdmissionSuccess
 */
export class AdmissionSuccess implements Action {
    public readonly type = ActionTypes.AdmissionSuccess;
    constructor(public payload: { token: string; decodeResult: IDecodeResult }) { }
}

/**
 * AdmissionFail
 */
export class AdmissionFail implements Action {
    public readonly type = ActionTypes.AdmissionFail;
    constructor(public payload: { error: Error, token: string; decodeResult: IDecodeResult }) { }
}

/**
 * Actions
 */
export type Actions =
    | Delete
    | SelectSchedule
    | SelectScheduleDate
    | SelectScreeningEvent
    | GetScreeningEvent
    | GetScreeningEventSuccess
    | GetScreeningEventFail
    | GetScreeningEventReservations
    | GetScreeningEventReservationsSuccess
    | GetScreeningEventReservationsFail
    | InitializeQrcodeToken
    | InitializeUsentList
    | ConvertQrcodeToToken
    | ConvertQrcodeToTokenSuccess
    | ConvertQrcodeToTokenFail
    | Admission
    | AdmissionSuccess
    | AdmissionFail;
