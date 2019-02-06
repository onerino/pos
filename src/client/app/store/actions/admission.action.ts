
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
    // GetScreeningEventReservations = '[Admission] Get Screening Reservations',
    // GetScreeningEventReservationsSuccess = '[Admission] Get Screening Events Reservations Success',
    // GetScreeningEventReservationsFail = '[Admission] Get Screening Events Reservations Fail',
    InitializeQrcodeToken = '[Admission] Initialize Qrcode Token',
    // ConvertQrcodeToToken = '[Admission] Convert Qrcode To Token',
    // ConvertQrcodeToTokenSuccess = '[Admission] Convert Qrcode To Token Success',
    // ConvertQrcodeToTokenFail = '[Admission] Convert Qrcode To Token Fail',
    // Admission = '[Admission] Admission',
    // AdmissionSuccess = '[Admission] Admission Success',
    // AdmissionFail = '[Admission] Admission Fail',
    Check = '[Admission] Check',
    CheckSuccess = '[Admission] Check Success',
    CheckFail = '[Admission] Check Fail'
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

// /**
//  * GetScreeningEventReservations
//  * @deprecated
//  */
// export class GetScreeningEventReservations implements Action {
//     public readonly type = ActionTypes.GetScreeningEventReservations;
//     constructor(public payload: { params: factory.chevre.reservation.event.ISearchConditions }) { }
// }

// /**
//  * GetScreeningEventReservationsSuccess
//  * @deprecated
//  */
// export class GetScreeningEventReservationsSuccess implements Action {
//     public readonly type = ActionTypes.GetScreeningEventReservationsSuccess;
//     constructor(public payload: {
//         screeningEventReservations: factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>[]
//     }) { }
// }

// /**
//  * GetScreeningEventReservationsFail
//  * @deprecated
//  */
// export class GetScreeningEventReservationsFail implements Action {
//     public readonly type = ActionTypes.GetScreeningEventReservationsFail;
//     constructor(public payload: { error: Error }) { }
// }

/**
 * InitializeQrcodeToken
 */
export class InitializeQrcodeToken implements Action {
    public readonly type = ActionTypes.InitializeQrcodeToken;
    constructor(public payload?: {}) { }
}

// /**
//  * ConvertQrcodeToToken
//  * @deprecated
//  */
// export class ConvertQrcodeToToken implements Action {
//     public readonly type = ActionTypes.ConvertQrcodeToToken;
//     constructor(public payload: {
//         params: {
//             code: string;
//             screeningEventReservations: factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>[];
//         }
//     }) { }
// }

// /**
//  * ConvertQrcodeToTokenSuccess
//  * @deprecated
//  */
// export class ConvertQrcodeToTokenSuccess implements Action {
//     public readonly type = ActionTypes.ConvertQrcodeToTokenSuccess;
//     constructor(public payload: {
//         token?: string;
//         decodeResult?: IDecodeResult;
//         availableReservation?: factory.chevre.reservation.event.ISearchConditions;
//         checkTokenActions: factory.action.check.token.IAction[];
//         statusCode: number;
//     }) { }
// }

// /**
//  * ConvertQrcodeToTokenFail
//  * @deprecated
//  */
// export class ConvertQrcodeToTokenFail implements Action {
//     public readonly type = ActionTypes.ConvertQrcodeToTokenFail;
//     constructor(public payload: { error: Error }) { }
// }

// /**
//  * Admission
//  * @deprecated
//  */
// export class Admission implements Action {
//     public readonly type = ActionTypes.Admission;
//     constructor(public payload: { token: string; decodeResult: IDecodeResult }) { }
// }

// /**
//  * AdmissionSuccess
//  * @deprecated
//  */
// export class AdmissionSuccess implements Action {
//     public readonly type = ActionTypes.AdmissionSuccess;
//     constructor(public payload: { token: string; decodeResult: IDecodeResult }) { }
// }

// /**
//  * AdmissionFail
//  * @deprecated
//  */
// export class AdmissionFail implements Action {
//     public readonly type = ActionTypes.AdmissionFail;
//     constructor(public payload: { error: Error, token: string; decodeResult: IDecodeResult }) { }
// }

/**
 * Check
 */
export class Check implements Action {
    public readonly type = ActionTypes.Check;
    constructor(public payload: {
        code: string;
        screeningEvent: factory.chevre.event.screeningEvent.IEvent
    }) { }
}

/**
 * CheckSuccess
 */
export class CheckSuccess implements Action {
    public readonly type = ActionTypes.CheckSuccess;
    constructor(public payload: {
        token?: string;
        decodeResult?: IDecodeResult;
        availableReservation?: factory.chevre.reservation.event.ISearchConditions;
        checkTokenActions: factory.action.check.token.IAction[];
        statusCode: number;
    }) { }
}

/**
 * CheckFail
 */
export class CheckFail implements Action {
    public readonly type = ActionTypes.CheckFail;
    constructor(public payload: { error: Error }) { }
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
    // | GetScreeningEventReservations
    // | GetScreeningEventReservationsSuccess
    // | GetScreeningEventReservationsFail
    | InitializeQrcodeToken
    // | ConvertQrcodeToToken
    // | ConvertQrcodeToTokenSuccess
    // | ConvertQrcodeToTokenFail
    // | Admission
    // | AdmissionSuccess
    // | AdmissionFail
    | Check
    | CheckSuccess
    | CheckFail;
