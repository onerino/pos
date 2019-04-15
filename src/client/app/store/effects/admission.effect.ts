import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status';
import * as decode from 'jwt-decode';
import { map, mergeMap } from 'rxjs/operators';
import { IDecodeResult } from '../../models';
import { CinerinoService } from '../../services';
import { admissionAction } from '../actions';

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
        ofType<admissionAction.GetScreeningEvent>(admissionAction.ActionTypes.GetScreeningEvent),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
                const screeningEvent = await this.cinerino.event.findScreeningEventById(payload.params);
                return new admissionAction.GetScreeningEventSuccess({ screeningEvent });
            } catch (error) {
                return new admissionAction.GetScreeningEventFail({ error: error });
            }
        })
    );

    /**
     * check
     */
    @Effect()
    public check = this.actions.pipe(
        ofType<admissionAction.Check>(admissionAction.ActionTypes.Check),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            const code = payload.code;
            const screeningEvent = payload.screeningEvent;
            try {
                await this.cinerino.getServices();
                const getTokenResult = await this.cinerino.admin.ownershipInfo.getToken({ code })
                    .catch((error) => {
                        console.error('getToken error');
                        throw error;
                    });
                const token = getTokenResult.token;
                const decodeResult = decode<IDecodeResult>(token);
                const checkTokenActionsResult =
                    await this.cinerino.admin.ownershipInfo.searchCheckTokenActions({ id: decodeResult.id });
                const checkTokenActions = checkTokenActionsResult.data;
                const limit = 100;
                let page = 1;
                let roop = true;
                let screeningEventReservations:
                    factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>[] = [];
                while (roop) {
                    const screeningEventReservationsResult =
                        await this.cinerino.reservation.searchScreeningEventReservations({
                            page,
                            limit,
                            sort: { reservationNumber: factory.chevre.sortType.Ascending },
                            reservationStatuses: [factory.chevre.reservationStatusType.ReservationConfirmed],
                            reservationFor: {
                                typeOf: factory.chevre.eventType.ScreeningEvent,
                                id: screeningEvent.id
                            },
                            ids: [decodeResult.typeOfGood.id]
                        });
                    screeningEventReservations =
                        screeningEventReservations.concat(screeningEventReservationsResult.data);
                    const lastPage = Math.ceil(screeningEventReservationsResult.totalCount / limit);
                    page++;
                    roop = !(page > lastPage);
                }

                // 利用可能判定
                const availableReservation = screeningEventReservations
                    .find((r) => r.id === decodeResult.typeOfGood.id);
                const statusCode = OK;
                if (availableReservation !== undefined) {
                    await this.cinerino.reservation.findScreeningEventReservationByToken({ token });
                }

                return new admissionAction.CheckSuccess({
                    token,
                    decodeResult,
                    availableReservation,
                    checkTokenActions,
                    statusCode
                });
            } catch (error) {
                return new admissionAction.CheckSuccess({
                    checkTokenActions: [],
                    statusCode: (error.code === undefined) ? INTERNAL_SERVER_ERROR : error.code
                });
            }
        })
    );
}
