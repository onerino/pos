import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { IReservationTicket, Reservation } from '../../../../models/purchase/reservation';
import { UtilService } from '../../../../services';
import { ActionTypes, SelectTickets, TemporaryReservation } from '../../../../store/actions/purchase.action';
import * as reducers from '../../../../store/reducers';
import { MvtkCheckModalComponent } from '../../../parts/mvtk-check-modal/mvtk-check-modal.component';
import { TicketListModalComponent } from '../../../parts/ticket-list-modal/ticket-list-modal.component';

@Component({
    selector: 'app-purchase-ticket',
    templateUrl: './purchase-ticket.component.html',
    styleUrls: ['./purchase-ticket.component.scss']
})
export class PurchaseTicketComponent implements OnInit {
    public purchase: Observable<reducers.IPurchaseState>;
    public isLoading: Observable<boolean>;
    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router,
        private modal: NgbModal,
        private util: UtilService,
        private translate: TranslateService
    ) { }

    public ngOnInit() {
        this.purchase = this.store.pipe(select(reducers.getPurchase));
        this.isLoading = this.store.pipe(select(reducers.getLoading));
    }

    public onSubmit() {
        this.purchase.subscribe((purchase) => {
            const transaction = purchase.transaction;
            const screeningEvent = purchase.screeningEvent;
            const reservations = purchase.reservations;
            const authorizeSeatReservation = purchase.authorizeSeatReservation;
            if (transaction === undefined
                || screeningEvent === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const unselectedReservations = reservations.filter((reservation) => {
                return (reservation.ticket === undefined);
            });
            if (unselectedReservations.length > 0) {
                this.util.openAlert({
                    title: this.translate.instant('common.error'),
                    body: this.translate.instant('purchase.ticket.alert.unselected')
                });
                return;
            }
            const validResult = reservations.filter((reservation) => {
                const unitPriceSpecification = reservation.getUnitPriceSpecification();
                if (unitPriceSpecification === undefined
                    || unitPriceSpecification.typeOf !== factory.chevre.priceSpecificationType.UnitPriceSpecification) {
                    return false;
                }
                const filterResult = reservations.filter((targetReservation) => {
                    return (reservation.ticket !== undefined
                        && targetReservation.ticket !== undefined
                        && reservation.ticket.ticketOffer.id === targetReservation.ticket.ticketOffer.id);
                });
                const value = (unitPriceSpecification.referenceQuantity.value === undefined)
                    ? 1
                    : unitPriceSpecification.referenceQuantity.value;

                return (filterResult.length % value !== 0);
            });
            if (validResult.length > 0) {
                this.util.openAlert({
                    title: this.translate.instant('common.error'),
                    body: this.translate.instant('purchase.ticket.alert.ticketCondition')
                });
                return;
            }
            this.store.dispatch(new TemporaryReservation({
                transaction,
                screeningEvent,
                reservations,
                authorizeSeatReservation
            }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.TemporaryReservationSuccess),
            tap(() => {
                this.purchase.subscribe((purchase) => {
                    if (purchase.authorizeSeatReservation === undefined
                        || purchase.authorizeSeatReservation.result === undefined) {
                        this.router.navigate(['/error']);
                        return;
                    }
                    this.router.navigate(['/purchase/cart']);
                }).unsubscribe();
            })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.TemporaryReservationFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public openTicketList(reservation: Reservation) {
        const modalRef = this.modal.open(TicketListModalComponent, {
            centered: true
        });
        this.purchase.subscribe((purchase) => {
            modalRef.componentInstance.screeningEventTicketOffers = purchase.screeningEventTicketOffers;
            modalRef.componentInstance.checkMovieTicketActions = purchase.checkMovieTicketActions;
            modalRef.componentInstance.reservations = purchase.reservations;
            modalRef.componentInstance.pendingMovieTickets = purchase.pendingMovieTickets;

            modalRef.result.then((ticket: IReservationTicket) => {
                reservation.ticket = ticket;
                this.store.dispatch(new SelectTickets({ reservations: [reservation] }));
            }).catch(() => { });
        }).unsubscribe();
    }

    public openMovieTicket() {
        this.modal.open(MvtkCheckModalComponent, {
            centered: true
        });
    }


}
