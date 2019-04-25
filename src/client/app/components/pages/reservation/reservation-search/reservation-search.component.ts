import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { getTicketPrice } from '../../../../functions';
import { IReservationSearchConditions } from '../../../../models';
import { reservationAction } from '../../../../store/actions';
import * as reducers from '../../../../store/reducers';
import { ReservationDetailModalComponent } from '../../../parts';

@Component({
    selector: 'app-reservation-search',
    templateUrl: './reservation-search.component.html',
    styleUrls: ['./reservation-search.component.scss']
})
export class ReservationSearchComponent implements OnInit {

    public isLoading: Observable<boolean>;
    public error: Observable<string | null>;
    public reservation: Observable<reducers.IReservationState>;
    public user: Observable<reducers.IUserState>;
    public moment: typeof moment = moment;
    public limit: number;
    public conditions: IReservationSearchConditions;
    public confirmedConditions: IReservationSearchConditions;
    public reservationStatus = factory.chevre.reservationStatusType;
    public getTicketPrice = getTicketPrice;

    constructor(
        private store: Store<reducers.IReservationState>,
        private actions: Actions,
        private modal: NgbModal,
        private router: Router
    ) { }

    public ngOnInit() {
        this.isLoading = this.store.pipe(select(reducers.getLoading));
        this.error = this.store.pipe(select(reducers.getError));
        this.reservation = this.store.pipe(select(reducers.getReservation));
        this.user = this.store.pipe(select(reducers.getUser));
        this.limit = 20;
        this.conditions = {
            reservationDateFrom: '',
            reservationDateThrough: '',
            eventStartDateFrom: '',
            eventStartDateThrough: '',
            id: '',
            reservationNumber: '',
            reservationStatus: '',
            page: 1
        };
        this.store.dispatch(new reservationAction.Delete());
    }

    /**
     * 検索
     */
    public reservationSearch(changeConditions: boolean) {
        if (changeConditions) {
            this.confirmedConditions = {
                reservationDateFrom: this.conditions.reservationDateFrom,
                reservationDateThrough: this.conditions.reservationDateThrough,
                eventStartDateFrom: this.conditions.eventStartDateFrom,
                eventStartDateThrough: this.conditions.eventStartDateThrough,
                id: this.conditions.id,
                reservationNumber: this.conditions.reservationNumber,
                reservationStatus: this.conditions.reservationStatus,
                page: 1
            };
        }
        this.user.subscribe((_user) => {
            this.store.dispatch(new reservationAction.Search({
                params: {
                    typeOf: factory.chevre.reservationType.EventReservation,
                    // seller: {
                    //     typeOf: (user.seller === undefined)
                    //         ? undefined : user.seller.typeOf,
                    //     ids: (user.seller === undefined)
                    //         ? undefined : [user.seller.id]
                    // },
                    bookingFrom: (this.confirmedConditions.reservationDateFrom === '')
                        ? undefined : moment(this.confirmedConditions.reservationDateFrom).toDate(),
                    bookingThrough: (this.confirmedConditions.reservationDateThrough === '')
                        ? undefined : moment(this.confirmedConditions.reservationDateThrough).add(1, 'day').toDate(),
                    reservationFor: {
                        startFrom: (this.confirmedConditions.eventStartDateFrom === '')
                            ? undefined : moment(this.confirmedConditions.eventStartDateFrom).toDate(),
                        startThrough: (this.confirmedConditions.eventStartDateThrough === '')
                            ? undefined : moment(this.confirmedConditions.eventStartDateThrough).add(1, 'day').toDate(),
                    },
                    ids: (this.confirmedConditions.id === '')
                        ? undefined : [this.confirmedConditions.id],
                    reservationStatuses: (this.confirmedConditions.reservationStatus === '')
                        ? undefined : [this.confirmedConditions.reservationStatus],
                    reservationNumbers: (this.confirmedConditions.reservationNumber === '')
                        ? undefined : [this.confirmedConditions.reservationNumber],
                    limit: this.limit,
                    page: this.confirmedConditions.page,
                    sort: {
                        // reservationDate: factory.sortType.Descending
                    }
                }
            }));
        }).unsubscribe();


        const success = this.actions.pipe(
            ofType(reservationAction.ActionTypes.SearchSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(reservationAction.ActionTypes.SearchFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    /**
     * 詳細を表示
     */
    public openDetail(reservation: factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>) {
        const modalRef = this.modal.open(ReservationDetailModalComponent, {
            centered: true,
            size: 'lg'
        });
        modalRef.componentInstance.reservation = reservation;
    }

}
