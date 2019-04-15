import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { getAmount, getTicketPrice, IScreeningEventWork, screeningEventsToWorkEvents } from '../../../../../functions';
import { IReservationTicket } from '../../../../../models';
import { UtilService } from '../../../../../services';
import { masterAction, purchaseAction } from '../../../../../store/actions';
import * as reducers from '../../../../../store/reducers';
import { PurchaseEventTicketModalComponent } from '../../../../parts';

@Component({
    selector: 'app-purchase-event-ticket',
    templateUrl: './purchase-event-ticket.component.html',
    styleUrls: ['./purchase-event-ticket.component.scss']
})
export class PurchaseEventTicketComponent implements OnInit, OnDestroy {
    public purchase: Observable<reducers.IPurchaseState>;
    public user: Observable<reducers.IUserState>;
    public master: Observable<reducers.IMasterState>;
    public error: Observable<string | null>;
    public screeningWorkEvents: IScreeningEventWork[];
    public moment: typeof moment = moment;
    public getTicketPrice = getTicketPrice;
    private updateTimer: any;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router,
        private util: UtilService,
        private translate: TranslateService,
        private modal: NgbModal
    ) { }

    public async ngOnInit() {
        this.purchase = this.store.pipe(select(reducers.getPurchase));
        this.user = this.store.pipe(select(reducers.getUser));
        this.master = this.store.pipe(select(reducers.getMaster));
        this.error = this.store.pipe(select(reducers.getError));
        this.screeningWorkEvents = [];

        this.getSchedule();
    }

    public ngOnDestroy() {
        clearTimeout(this.updateTimer);
    }

    private update() {
        if (this.updateTimer !== undefined) {
            clearTimeout(this.updateTimer);
        }
        const time = 600000; // 10 * 60 * 1000
        this.updateTimer = setTimeout(() => {
            this.getSchedule();
        }, time);
    }

    /**
     * getSchedule
     */
    public getSchedule() {
        this.purchase.subscribe((purchase) => {
            this.user.subscribe((user) => {
                const seller = user.seller;
                const scheduleDate = purchase.scheduleDate;
                if (seller === undefined || scheduleDate === undefined) {
                    this.router.navigate(['/error']);
                    return;
                }
                this.store.dispatch(new masterAction.GetSchedule({
                    superEvent: {
                        locationBranchCodes:
                            (seller.location === undefined || seller.location.branchCode === undefined) ? [] : [seller.location.branchCode]
                    },
                    startFrom: moment(scheduleDate).toDate(),
                    startThrough: moment(scheduleDate).add(1, 'day').toDate()
                }));
            }).unsubscribe();
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(masterAction.ActionTypes.GetScheduleSuccess),
            tap(() => {
                this.master.subscribe((master) => {
                    const screeningEvents = master.screeningEvents;
                    this.screeningWorkEvents = screeningEventsToWorkEvents({ screeningEvents });
                    this.update();
                }).unsubscribe();
            })
        );

        const fail = this.actions.pipe(
            ofType(masterAction.ActionTypes.GetScheduleFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public selectSchedule(screeningEvent: factory.event.screeningEvent.IEvent) {
        this.user.subscribe((user) => {
            this.purchase.subscribe((purchase) => {
                if (purchase.authorizeSeatReservations.length >= user.purchaseCartMaxLength) {
                    this.util.openAlert({
                        title: this.translate.instant('common.error'),
                        body: this.translate.instant('purchase.event.ticket.alert.limit', { value: user.purchaseCartMaxLength })
                    });
                    return;
                }
                this.store.dispatch(new purchaseAction.SelectSchedule({ screeningEvent }));
                this.getTickets();
            }).unsubscribe();
        }).unsubscribe();
    }

    /**
     * getTickets
     */
    private getTickets() {
        this.user.subscribe((user) => {
            this.purchase.subscribe((purchase) => {
                const screeningEvent = purchase.screeningEvent;
                const seller = user.seller;
                if (screeningEvent === undefined || seller === undefined) {
                    this.router.navigate(['/error']);
                    return;
                }
                this.store.dispatch(new purchaseAction.GetTicketList({ screeningEvent, seller }));
            }).unsubscribe();
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.GetTicketListSuccess),
            tap(() => {
                this.openTicketList();
            })
        );

        const fail = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.GetTicketListFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    private openTicketList() {
        const modalRef = this.modal.open(PurchaseEventTicketModalComponent, {
            centered: true
        });
        this.purchase.subscribe((purchase) => {
            modalRef.componentInstance.screeningEventTicketOffers = purchase.screeningEventTicketOffers;
            modalRef.componentInstance.screeningEvent = purchase.screeningEvent;
            modalRef.result.then((reservationTickets: IReservationTicket[]) => {
                this.temporaryReservation(reservationTickets);
            }).catch(() => { });
        }).unsubscribe();
    }

    private temporaryReservation(reservationTickets: IReservationTicket[]) {
        this.purchase.subscribe((purchase) => {
            if (purchase.transaction === undefined
                || purchase.screeningEvent === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const transaction = purchase.transaction;
            const screeningEvent = purchase.screeningEvent;
            this.store.dispatch(new purchaseAction.TemporaryReservationFreeSeat({
                transaction,
                screeningEvent,
                reservationTickets
            }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.TemporaryReservationFreeSeatSuccess),
            tap(() => {
                this.util.openAlert({
                    title: this.translate.instant('common.complete'),
                    body: this.translate.instant('purchase.event.ticket.success.temporaryReservation')
                });
            })
        );

        const fail = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.TemporaryReservationFreeSeatFail),
            tap(() => {
                this.util.openAlert({
                    title: this.translate.instant('common.error'),
                    body: this.translate.instant('purchase.event.ticket.alert.temporaryReservation')
                });
            })
        );
        race(success, fail).pipe(take(1)).subscribe();

    }

    public onSubmit() {
        this.purchase.subscribe((purchase) => {
            if (purchase.authorizeSeatReservations.length === 0) {
                this.util.openAlert({
                    title: this.translate.instant('common.error'),
                    body: this.translate.instant('purchase.event.ticket.alert.unselected')
                });
                return;
            }
            const amount = getAmount(purchase.authorizeSeatReservations);
            if (amount > 0) {
                this.router.navigate(['/purchase/payment']);
                return;
            }
            this.router.navigate(['/purchase/confirm']);
        }).unsubscribe();
    }

    public removeItemProcess(
        authorizeSeatReservations: factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier>[]
    ) {
        this.purchase.subscribe((purchase) => {
            if (purchase.transaction === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            this.store.dispatch(new purchaseAction.CancelTemporaryReservations({ authorizeSeatReservations }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.CancelTemporaryReservationsSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.CancelTemporaryReservationsFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public removeItem(authorizeSeatReservation: factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier>) {
        this.util.openConfirm({
            title: this.translate.instant('common.confirm'),
            body: this.translate.instant('purchase.event.cart.confirm.cancel'),
            cb: () => {
                const authorizeSeatReservations = [authorizeSeatReservation];
                this.removeItemProcess(authorizeSeatReservations);
            }
        });
    }

}

