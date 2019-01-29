import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { OK } from 'http-status';
import * as decode from 'jwt-decode';
import { map, mergeMap } from 'rxjs/operators';
import { IDecodeResult } from '../../models';
import { CinerinoService } from '../../services';
import {
    ActionTypes,
    Admission,
    AdmissionFail,
    AdmissionSuccess,
    ConvertQrcodeToToken,
    ConvertQrcodeToTokenFail,
    ConvertQrcodeToTokenSuccess,
    GetScreeningEvent,
    GetScreeningEventFail,
    GetScreeningEventReservations,
    GetScreeningEventReservationsFail,
    GetScreeningEventReservationsSuccess,
    GetScreeningEventSuccess
} from '../actions/admission.action';

/**
 * AdmissionEffects
 */
@Injectable()
export class AdmissionEffects {

    constructor(
        private actions: Actions,
        private cinerino: CinerinoService,
    ) { }

    /**
     * getScreeningEvent
     */
    @Effect()
    public getScreeningEvent = this.actions.pipe(
        ofType<GetScreeningEvent>(ActionTypes.GetScreeningEvent),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
                const screeningEvent = await this.cinerino.event.findScreeningEventById(payload.params);
                return new GetScreeningEventSuccess({ screeningEvent });
            } catch (error) {
                return new GetScreeningEventFail({ error: error });
            }
        })
    );

    /**
     * getScreeningEventReservations
     */
    @Effect()
    public getScreeningEventReservations = this.actions.pipe(
        ofType<GetScreeningEventReservations>(ActionTypes.GetScreeningEventReservations),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
                const limit = 100;
                const params = payload.params;
                params.limit = limit;
                const screeningEventReservationsResult = await this.cinerino.reservation.searchScreeningEventReservations(params);
                let screeningEventReservations = screeningEventReservationsResult.data;
                if (screeningEventReservationsResult.totalCount > limit) {
                    const pageCount = Math.floor(screeningEventReservationsResult.totalCount / limit);
                    for (let i = 0; i < pageCount; i++) {
                        params.page = i + 2;
                        const screeningEventReservationsPageResult =
                            await this.cinerino.reservation.searchScreeningEventReservations(params);
                        screeningEventReservations = screeningEventReservations.concat(screeningEventReservationsPageResult.data);
                    }
                }

                return new GetScreeningEventReservationsSuccess({ screeningEventReservations });
            } catch (error) {
                return new GetScreeningEventReservationsFail({ error: error });
            }
        })
    );

    /**
     * convertQrcodeToToken
     */
    @Effect()
    public convertQrcodeToToken = this.actions.pipe(
        ofType<ConvertQrcodeToToken>(ActionTypes.ConvertQrcodeToToken),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
            } catch (error) {
                return new ConvertQrcodeToTokenFail({ error });
            }
            const code = payload.params.code;
            const screeningEventReservations = payload.params.screeningEventReservations;
            let token: string;
            try {
                const getTokenResult = await this.cinerino.admin.ownershipInfo.getToken({ code });
                token = getTokenResult.token;
            } catch (error) {
                const checkTokenActions: factory.action.check.token.IAction[] = [];
                const isAvailable = false;
                const statusCode = error.code;
                return new ConvertQrcodeToTokenSuccess({ checkTokenActions, isAvailable, statusCode });
            }
            try {
                const decodeResult = decode<IDecodeResult>(token);
                const checkTokenActionsResult = await this.cinerino.admin.ownershipInfo.searchCheckTokenActions({ id: decodeResult.id });
                const checkTokenActions = checkTokenActionsResult.data;
                // 利用可能判定
                const availableReservation = screeningEventReservations
                    .filter((r) => r.reservationStatus === factory.chevre.reservationStatusType.ReservationConfirmed)
                    .find((r) => r.id === decodeResult.typeOfGood.id);
                const isAvailable = availableReservation !== undefined;
                const statusCode = OK;
                return new ConvertQrcodeToTokenSuccess({
                    token, decodeResult, availableReservation, checkTokenActions, isAvailable, statusCode
                });
            } catch (error) {
                return new ConvertQrcodeToTokenFail({ error });
            }
        })
    );

    /**
     * Admission
     */
    @Effect()
    public Admission = this.actions.pipe(
        ofType<Admission>(ActionTypes.Admission),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            const token = payload.token;
            const decodeResult = payload.decodeResult;
            try {
                await this.cinerino.getServices();
                await this.cinerino.reservation.findScreeningEventReservationByToken({ token });

                return new AdmissionSuccess({ token, decodeResult });
            } catch (error) {
                return new AdmissionFail({ error, token, decodeResult });
            }
        })
    );
}
