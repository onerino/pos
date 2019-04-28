import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
    createCompleteMail,
    createMovieTicketsFromAuthorizeSeatReservation,
    formatTelephone,
    isTicketedSeatScreeningEvent
} from '../../functions';
import { IScreen } from '../../models';
import { CinerinoService, UtilService } from '../../services';
import { purchaseAction } from '../actions';

/**
 * Purchase Effects
 */
@Injectable()
export class PurchaseEffects {

    constructor(
        private actions: Actions,
        private cinerino: CinerinoService,
        private http: HttpClient,
        private util: UtilService
    ) { }

    /**
     * StartTransaction
     */
    @Effect()
    public startTransaction = this.actions.pipe(
        ofType<purchaseAction.StartTransaction>(purchaseAction.ActionTypes.StartTransaction),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const params = payload.params;
                const selleId = params.seller.id;
                await this.cinerino.getServices();
                const passport = await this.cinerino.getPassport(selleId);
                params.object = { passport };
                const transaction = await this.cinerino.transaction.placeOrder.start(params);
                return new purchaseAction.StartTransactionSuccess({ transaction });
            } catch (error) {
                return new purchaseAction.StartTransactionFail({ error: error });
            }
        })
    );

    /**
     * getScreen
     */
    @Effect()
    public getScreen = this.actions.pipe(
        ofType<purchaseAction.GetScreen>(purchaseAction.ActionTypes.GetScreen),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                await this.cinerino.getServices();
                let theaterCode;
                let screenCode;
                let screeningEventOffers: factory.chevre.event.screeningEvent.IScreeningRoomSectionOffer[];
                if (payload.test) {
                    screeningEventOffers = [];
                    theaterCode = payload.theaterCode;
                    screenCode = `000${payload.screenCode}`.slice(-3);
                } else {
                    screeningEventOffers = await this.cinerino.event.searchScreeningEventOffers({
                        eventId: payload.screeningEvent.id
                    });
                    theaterCode = payload.screeningEvent.superEvent.location.branchCode;
                    screenCode = `000${payload.screeningEvent.location.branchCode}`.slice(-3);
                }
                const screen = await this.http.get<IScreen>(
                    `${environment.PROJECT_ID}/json/theater/${theaterCode}/${screenCode}.json?${moment().format('YYYYMMDDHHmm')}`
                ).toPromise();
                const setting = await this.http.get<IScreen>(`${environment.PROJECT_ID}/json/theater/setting.json`).toPromise();
                const screenData = Object.assign(setting, screen);
                return new purchaseAction.GetScreenSuccess({ screeningEventOffers, screenData });
            } catch (error) {
                return new purchaseAction.GetScreenFail({ error: error });
            }
        })
    );

    /**
     * temporaryReservation
     */
    @Effect()
    public temporaryReservation = this.actions.pipe(
        ofType<purchaseAction.TemporaryReservation>(purchaseAction.ActionTypes.TemporaryReservation),
        map(action => action.payload),
        mergeMap(async (payload) => {
            const transaction = payload.transaction;
            const screeningEvent = payload.screeningEvent;
            const reservations = payload.reservations;
            try {
                await this.cinerino.getServices();
                if (payload.authorizeSeatReservation !== undefined) {
                    await this.cinerino.transaction.placeOrder.voidSeatReservation(payload.authorizeSeatReservation);
                }
                const authorizeSeatReservation = await this.cinerino.transaction.placeOrder.authorizeSeatReservation({
                    object: {
                        event: {
                            id: screeningEvent.id
                        },
                        acceptedOffer: reservations.map((reservation) => {
                            if (reservation.ticket === undefined) {
                                throw new Error('ticket is undefined');
                            }
                            return {
                                id: reservation.ticket.ticketOffer.id,
                                ticketedSeat: reservation.seat,
                                additionalProperty: [] // ここにムビチケ情報を入れる
                            };
                        })
                    },
                    purpose: transaction
                });
                return new purchaseAction.TemporaryReservationSuccess({ authorizeSeatReservation });
            } catch (error) {
                return new purchaseAction.TemporaryReservationFail({ error: error });
            }
        })
    );

    /**
     * temporaryReservationFreeSeat
     */
    @Effect()
    public temporaryReservationFreeSeat = this.actions.pipe(
        ofType<purchaseAction.TemporaryReservationFreeSeat>(purchaseAction.ActionTypes.TemporaryReservationFreeSeat),
        map(action => action.payload),
        mergeMap(async (payload) => {
            const transaction = payload.transaction;
            const screeningEvent = payload.screeningEvent;
            const reservationTickets = payload.reservationTickets;
            const freeSeats: factory.chevre.reservation.ISeat<factory.chevre.reservationType.EventReservation>[] = [];
            try {
                await this.cinerino.getServices();
                if (isTicketedSeatScreeningEvent(screeningEvent)) {
                    const screeningEventOffers = await this.cinerino.event.searchScreeningEventOffers({
                        eventId: payload.screeningEvent.id
                    });
                    for (const screeningEventOffer of screeningEventOffers) {
                        const section = screeningEventOffer.branchCode;
                        for (const containsPlace of screeningEventOffer.containsPlace) {
                            if (containsPlace.offers !== undefined
                                && containsPlace.offers[0].availability === factory.chevre.itemAvailability.InStock) {
                                freeSeats.push({
                                    typeOf: containsPlace.typeOf,
                                    seatingType: <any>containsPlace.seatingType,
                                    seatNumber: containsPlace.branchCode,
                                    seatRow: '',
                                    seatSection: section
                                });
                            }
                        }
                    }
                }
                const authorizeSeatReservation = await this.cinerino.transaction.placeOrder.authorizeSeatReservation({
                    object: {
                        event: {
                            id: screeningEvent.id
                        },
                        acceptedOffer: reservationTickets.map((ticket, index) => {
                            return {
                                id: ticket.ticketOffer.id,
                                ticketedSeat: (freeSeats.length > 0) ? freeSeats[index] : undefined,
                                additionalProperty: [] // ここにムビチケ情報を入れる
                            };
                        })
                    },
                    purpose: transaction
                });
                return new purchaseAction.TemporaryReservationFreeSeatSuccess({
                    addAuthorizeSeatReservation: authorizeSeatReservation
                });
            } catch (error) {
                return new purchaseAction.TemporaryReservationFreeSeatFail({ error: error });
            }
        })
    );

    /**
     * cancelTemporaryReservations
     */
    @Effect()
    public cancelTemporaryReservations = this.actions.pipe(
        ofType<purchaseAction.CancelTemporaryReservations>(purchaseAction.ActionTypes.CancelTemporaryReservations),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const authorizeSeatReservations = payload.authorizeSeatReservations;
                await this.cinerino.getServices();
                for (const authorizeSeatReservation of authorizeSeatReservations) {
                    await this.cinerino.transaction.placeOrder.voidSeatReservation(authorizeSeatReservation);
                }

                return new purchaseAction.CancelTemporaryReservationsSuccess({ authorizeSeatReservations });
            } catch (error) {
                return new purchaseAction.CancelTemporaryReservationsFail({ error: error });
            }
        })
    );


    /**
     * getTicketList
     */
    @Effect()
    public getTicketList = this.actions.pipe(
        ofType<purchaseAction.GetTicketList>(purchaseAction.ActionTypes.GetTicketList),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                await this.cinerino.getServices();
                const clientId = this.cinerino.auth.options.clientId;
                const screeningEvent = payload.screeningEvent;
                const seller = payload.seller;
                const screeningEventTicketOffers = await this.cinerino.event.searchScreeningEventTicketOffers({
                    event: { id: screeningEvent.id },
                    seller: { typeOf: seller.typeOf, id: seller.id },
                    store: { id: clientId }
                });

                return new purchaseAction.GetTicketListSuccess({ screeningEventTicketOffers });
            } catch (error) {
                return new purchaseAction.GetTicketListFail({ error: error });
            }
        })
    );

    /**
     * registerContact
     */
    @Effect()
    public registerContact = this.actions.pipe(
        ofType<purchaseAction.RegisterContact>(purchaseAction.ActionTypes.RegisterContact),
        map(action => action.payload),
        mergeMap(async (payload) => {
            const transaction = payload.transaction;
            const contact = payload.contact;
            if (contact.telephone !== undefined) {
                contact.telephone = formatTelephone(contact.telephone);
            }
            try {
                await this.cinerino.getServices();
                const customerContact =
                    await this.cinerino.transaction.placeOrder.setCustomerContact({
                        id: transaction.id,
                        object: {
                            customerContact: contact
                        }
                    });

                return new purchaseAction.RegisterContactSuccess({ customerContact });
            } catch (error) {
                return new purchaseAction.RegisterContactFail({ error: error });
            }
        })
    );

    /**
     * authorizeCreditCard
     */
    @Effect()
    public authorizeCreditCard = this.actions.pipe(
        ofType<purchaseAction.AuthorizeCreditCard>(purchaseAction.ActionTypes.AuthorizeCreditCard),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const gmoTokenObject = payload.gmoTokenObject;
                const amount = payload.amount;
                await this.cinerino.getServices();
                if (payload.authorizeCreditCardPayment !== undefined) {
                    await this.cinerino.transaction.placeOrder.voidPayment(payload.authorizeCreditCardPayment);
                }
                const transaction = payload.transaction;
                const creditCard = { token: gmoTokenObject.token };
                const authorizeCreditCardPaymentResult =
                    await this.cinerino.transaction.placeOrder.authorizeCreditCardPayment({
                        object: {
                            typeOf: factory.paymentMethodType.CreditCard,
                            amount,
                            method: <any>'1',
                            creditCard
                        },
                        purpose: transaction
                    });

                return new purchaseAction.AuthorizeCreditCardSuccess({ authorizeCreditCardPayment: authorizeCreditCardPaymentResult });
            } catch (error) {
                return new purchaseAction.AuthorizeCreditCardFail({ error: error });
            }
        })
    );

    /**
     * authorizeMovieTicket
     */
    @Effect()
    public authorizeMovieTicket = this.actions.pipe(
        ofType<purchaseAction.AuthorizeMovieTicket>(purchaseAction.ActionTypes.AuthorizeMovieTicket),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                await this.cinerino.getServices();
                if (payload.authorizeMovieTicketPayments.length > 0) {
                    for (const authorizeMovieTicketPayment of payload.authorizeMovieTicketPayments) {
                        await this.cinerino.transaction.placeOrder.voidPayment(authorizeMovieTicketPayment);
                    }
                }
                const transaction = payload.transaction;
                const pendingMovieTickets = payload.pendingMovieTickets;
                const authorizeSeatReservations = payload.authorizeSeatReservations;
                const authorizeMovieTicketPayments: factory.action.authorize.paymentMethod.movieTicket.IAction[] = [];
                for (const authorizeSeatReservation of authorizeSeatReservations) {
                    const movieTickets = createMovieTicketsFromAuthorizeSeatReservation({
                        authorizeSeatReservation, pendingMovieTickets
                    });
                    const movieTicketIdentifiers: {
                        identifier: string;
                        movieTickets: factory.paymentMethod.paymentCard.movieTicket.IMovieTicket[]
                    }[] = [];
                    movieTickets.forEach((movieTicket) => {
                        const findResult = movieTicketIdentifiers.find((movieTicketIdentifier) => {
                            return (movieTicketIdentifier.identifier === movieTicket.identifier);
                        });
                        if (findResult === undefined) {
                            movieTicketIdentifiers.push({
                                identifier: movieTicket.identifier, movieTickets: [movieTicket]
                            });
                            return;
                        }
                        findResult.movieTickets.push(movieTicket);
                    });
                    for (const movieTicketIdentifier of movieTicketIdentifiers) {
                        const authorizeMovieTicketPaymentResult =
                            await this.cinerino.transaction.placeOrder.authorizeMovieTicketPayment({
                                object: {
                                    typeOf: factory.paymentMethodType.MovieTicket,
                                    amount: 0,
                                    movieTickets: movieTicketIdentifier.movieTickets
                                },
                                purpose: transaction
                            });
                        authorizeMovieTicketPayments.push(authorizeMovieTicketPaymentResult);
                    }
                }

                return new purchaseAction.AuthorizeMovieTicketSuccess({ authorizeMovieTicketPayments });
            } catch (error) {
                return new purchaseAction.AuthorizeMovieTicketFail({ error: error });
            }
        })
    );
    /**
     * checkMovieTicket
     */
    @Effect()
    public checkMovieTicket = this.actions.pipe(
        ofType<purchaseAction.CheckMovieTicket>(purchaseAction.ActionTypes.CheckMovieTicket),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                await this.cinerino.getServices();
                const screeningEvent = payload.screeningEvent;
                const movieTickets = payload.movieTickets;
                const checkMovieTicketAction = await this.cinerino.payment.checkMovieTicket({
                    typeOf: factory.paymentMethodType.MovieTicket,
                    movieTickets: movieTickets.map((movieTicket) => {
                        return {
                            ...movieTicket,
                            serviceType: '', // 情報空でよし
                            serviceOutput: {
                                reservationFor: {
                                    typeOf: screeningEvent.typeOf,
                                    id: screeningEvent.id
                                },
                                reservedTicket: {
                                    ticketedSeat: {
                                        typeOf: factory.chevre.placeType.Seat,
                                        seatingType: <any>'', // 情報空でよし
                                        seatNumber: '', // 情報空でよし
                                        seatRow: '', // 情報空でよし
                                        seatSection: '' // 情報空でよし
                                    }
                                }
                            }
                        };
                    }),
                    seller: {
                        typeOf: payload.transaction.seller.typeOf,
                        id: payload.transaction.seller.id
                    }
                });

                return new purchaseAction.CheckMovieTicketSuccess({ checkMovieTicketAction });
            } catch (error) {
                return new purchaseAction.CheckMovieTicketFail({ error: error });
            }
        })
    );

    /**
     * reserve
     */
    @Effect()
    public reserve = this.actions.pipe(
        ofType<purchaseAction.Reserve>(purchaseAction.ActionTypes.Reserve),
        map(action => action.payload),
        mergeMap(async (payload) => {
            const transaction = payload.transaction;
            const authorizeSeatReservations = payload.authorizeSeatReservations;
            const seller = payload.seller;
            try {
                await this.cinerino.getServices();
                const params = {
                    id: transaction.id,
                    options: {
                        sendEmailMessage: true,
                        emailTemplate: <string | undefined>undefined
                    }
                };
                if (environment.PURCHASE_COMPLETE_MAIL_CUSTOM) {
                    // 完了メールをカスタマイズ
                    const url = `/${environment.PROJECT_ID}/text/purchase/mail/complete.txt`;
                    const template = await this.util.getText<string>(url);
                    params.options.emailTemplate = createCompleteMail({
                        template,
                        authorizeSeatReservations,
                        seller
                    });
                }

                const result = await this.cinerino.transaction.placeOrder.confirm(params);
                return new purchaseAction.ReserveSuccess({ order: result.order });
            } catch (error) {
                await this.cinerino.transaction.placeOrder.cancel({
                    id: transaction.id
                });
                return new purchaseAction.ReserveFail({ error: error });
            }
        })
    );

    /**
     * AuthorizeAnyPayment
     */
    @Effect()
    public addAuthorizeAnyPayment = this.actions.pipe(
        ofType<purchaseAction.AuthorizeAnyPayment>(purchaseAction.ActionTypes.AuthorizeAnyPayment),
        map(action => action.payload),
        mergeMap(async (payload) => {
            const transaction = payload.transaction;
            const typeOf = payload.typeOf;
            const amount = payload.amount;
            const additionalProperty = payload.additionalProperty;
            try {
                await this.cinerino.getServices();
                const authorizeAnyPayment =
                    await this.cinerino.transaction.placeOrder.authorizeAnyPayment({
                        object: { typeOf, amount, additionalProperty },
                        purpose: transaction
                    });
                return new purchaseAction.AuthorizeAnyPaymentSuccess({ authorizeAnyPayment });
            } catch (error) {
                return new purchaseAction.AuthorizeAnyPaymentFail({ error: error });
            }
        })
    );
}
