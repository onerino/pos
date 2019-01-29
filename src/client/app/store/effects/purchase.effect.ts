import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, mergeMap } from 'rxjs/operators';
import {
    createMovieTicketsFromAuthorizeSeatReservation,
    createOrderId,
    formatTelephone
} from '../../functions';
import { IScreen } from '../../models';
import { CinerinoService } from '../../services/cinerino.service';
import * as purchase from '../actions/purchase.action';

/**
 * Purchase Effects
 */
@Injectable()
export class PurchaseEffects {

    constructor(
        private actions: Actions,
        private cinerino: CinerinoService,
        private http: HttpClient
    ) { }

    /**
     * StartTransaction
     */
    @Effect()
    public startTransaction = this.actions.pipe(
        ofType<purchase.StartTransaction>(purchase.ActionTypes.StartTransaction),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const params = payload.params;
                const selleId = params.seller.id;
                await this.cinerino.getServices();
                const passport = await this.cinerino.getPassport(selleId);
                params.object = { passport };
                const transaction = await this.cinerino.transaction.placeOrder.start(params);
                return new purchase.StartTransactionSuccess({ transaction });
            } catch (error) {
                return new purchase.StartTransactionFail({ error: error });
            }
        })
    );

    /**
     * getScreen
     */
    @Effect()
    public getScreen = this.actions.pipe(
        ofType<purchase.GetScreen>(purchase.ActionTypes.GetScreen),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                await this.cinerino.getServices();
                const screeningEventOffers = await this.cinerino.event.searchScreeningEventOffers({
                    eventId: payload.screeningEvent.id
                });
                const theaterCode = payload.screeningEvent.superEvent.location.branchCode;
                const screenCode = `000${payload.screeningEvent.location.branchCode}`.slice(-3);
                const screen = await this.http.get<IScreen>(`/json/theater/${theaterCode}/${screenCode}.json`).toPromise();
                const setting = await this.http.get<IScreen>('/json/theater/setting.json').toPromise();
                const screenData = Object.assign(setting, screen);
                return new purchase.GetScreenSuccess({ screeningEventOffers, screenData });
            } catch (error) {
                return new purchase.GetScreenFail({ error: error });
            }
        })
    );

    /**
     * temporaryReservation
     */
    @Effect()
    public temporaryReservation = this.actions.pipe(
        ofType<purchase.TemporaryReservation>(purchase.ActionTypes.TemporaryReservation),
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
                return new purchase.TemporaryReservationSuccess({ authorizeSeatReservation });
            } catch (error) {
                return new purchase.TemporaryReservationFail({ error: error });
            }
        })
    );

    /**
     * cancelTemporaryReservation
     */
    @Effect()
    public cancelTemporaryReservation = this.actions.pipe(
        ofType<purchase.CancelTemporaryReservation>(purchase.ActionTypes.CancelTemporaryReservation),
        map(action => action.payload),
        mergeMap(async (payload) => {
            const authorizeSeatReservation = payload.authorizeSeatReservation;
            try {
                await this.cinerino.getServices();
                await this.cinerino.transaction.placeOrder.voidSeatReservation(authorizeSeatReservation);

                return new purchase.CancelTemporaryReservationSuccess({ authorizeSeatReservation });
            } catch (error) {
                return new purchase.CancelTemporaryReservationSuccess({ authorizeSeatReservation });
                // return new purchase.CancelTemporaryReservationFail({ error: error });
            }
        })
    );


    /**
     * getTicketList
     */
    @Effect()
    public getTicketList = this.actions.pipe(
        ofType<purchase.GetTicketList>(purchase.ActionTypes.GetTicketList),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                await this.cinerino.getServices();
                const clientId = this.cinerino.auth.options.clientId;
                const screeningEvent = payload.screeningEvent;
                const movieTheater = payload.movieTheater;
                const screeningEventTicketOffers = await this.cinerino.event.searchScreeningEventTicketOffers({
                    event: { id: screeningEvent.id },
                    seller: { typeOf: movieTheater.typeOf, id: movieTheater.id },
                    store: { id: clientId }
                });

                return new purchase.GetTicketListSuccess({ screeningEventTicketOffers });
            } catch (error) {
                return new purchase.GetTicketListFail({ error: error });
            }
        })
    );

    /**
     * registerContact
     */
    @Effect()
    public registerContact = this.actions.pipe(
        ofType<purchase.RegisterContact>(purchase.ActionTypes.RegisterContact),
        map(action => action.payload),
        mergeMap(async (payload) => {
            const transaction = payload.transaction;
            const contact = payload.contact;
            contact.telephone = formatTelephone(contact.telephone);
            try {
                await this.cinerino.getServices();
                const customerContact =
                    await this.cinerino.transaction.placeOrder.setCustomerContact({
                        id: transaction.id,
                        object: {
                            customerContact: contact
                        }
                    });

                return new purchase.RegisterContactSuccess({ customerContact });
            } catch (error) {
                return new purchase.RegisterContactFail({ error: error });
            }
        })
    );

    /**
     * authorizeCreditCard
     */
    @Effect()
    public authorizeCreditCard = this.actions.pipe(
        ofType<purchase.AuthorizeCreditCard>(purchase.ActionTypes.AuthorizeCreditCard),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const orderCount = payload.orderCount;
                const gmoTokenObject = payload.gmoTokenObject;
                const amount = payload.amount;
                await this.cinerino.getServices();
                if (payload.authorizeCreditCardPayment !== undefined) {
                    await this.cinerino.transaction.placeOrder.voidPayment(payload.authorizeCreditCardPayment);
                }
                const transaction = payload.transaction;
                const orderId = createOrderId({ orderCount, transaction });
                const creditCard = { token: gmoTokenObject.token };
                const authorizeCreditCardPaymentResult =
                    await this.cinerino.transaction.placeOrder.authorizeCreditCardPayment({
                        object: {
                            typeOf: factory.paymentMethodType.CreditCard,
                            orderId,
                            amount,
                            method: <any>'1',
                            creditCard
                        },
                        purpose: transaction
                    });

                return new purchase.AuthorizeCreditCardSuccess({ authorizeCreditCardPayment: authorizeCreditCardPaymentResult });
            } catch (error) {
                return new purchase.AuthorizeCreditCardFail({ error: error });
            }
        })
    );

    /**
     * authorizeMovieTicket
     */
    @Effect()
    public authorizeMovieTicket = this.actions.pipe(
        ofType<purchase.AuthorizeMovieTicket>(purchase.ActionTypes.AuthorizeMovieTicket),
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

                return new purchase.AuthorizeMovieTicketSuccess({ authorizeMovieTicketPayments });
            } catch (error) {
                return new purchase.AuthorizeMovieTicketFail({ error: error });
            }
        })
    );
    /**
     * checkMovieTicket
     */
    @Effect()
    public checkMovieTicket = this.actions.pipe(
        ofType<purchase.CheckMovieTicket>(purchase.ActionTypes.CheckMovieTicket),
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

                return new purchase.CheckMovieTicketSuccess({ checkMovieTicketAction });
            } catch (error) {
                return new purchase.CheckMovieTicketFail({ error: error });
            }
        })
    );

    /**
     * reserve
     */
    @Effect()
    public reserve = this.actions.pipe(
        ofType<purchase.Reserve>(purchase.ActionTypes.Reserve),
        map(action => action.payload),
        mergeMap(async (payload) => {
            const transaction = payload.transaction;
            try {
                await this.cinerino.getServices();
                const result = await this.cinerino.transaction.placeOrder.confirm({
                    id: transaction.id,
                    options: {
                        sendEmailMessage: true
                    }
                });
                return new purchase.ReserveSuccess({ order: result.order });
            } catch (error) {
                await this.cinerino.transaction.placeOrder.cancel({
                    id: transaction.id
                });
                return new purchase.ReserveFail({ error: error });
            }
        })
    );

    /**
     * AuthorizeAnyPayment
     */
    @Effect()
    public addAuthorizeAnyPayment = this.actions.pipe(
        ofType<purchase.AuthorizeAnyPayment>(purchase.ActionTypes.AuthorizeAnyPayment),
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
                return new purchase.AuthorizeAnyPaymentSuccess({ authorizeAnyPayment });
            } catch (error) {
                return new purchase.AuthorizeAnyPaymentFail({ error: error });
            }
        })
    );
}
