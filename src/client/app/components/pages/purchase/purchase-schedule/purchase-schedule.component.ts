import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { SwiperComponent, SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { IScreeningEventFilm, screeningEventsToFilmEvents } from '../../../../functions';
import * as masterAction from '../../../../store/actions/master.action';
import * as purchaseAction from '../../../../store/actions/purchase.action';
import * as reducers from '../../../../store/reducers';
import { PurchaseTransactionModalComponent } from '../../../parts/purchase-transaction-modal/purchase-transaction-modal.component';

@Component({
    selector: 'app-purchase-schedule',
    templateUrl: './purchase-schedule.component.html',
    styleUrls: ['./purchase-schedule.component.scss']
})
export class PurchaseScheduleComponent implements OnInit, OnDestroy {
    @ViewChild(SwiperComponent) public componentRef: SwiperComponent;
    @ViewChild(SwiperDirective) public directiveRef: SwiperDirective;
    public purchase: Observable<reducers.IPurchaseState>;
    public master: Observable<reducers.IMasterState>;
    public user: Observable<reducers.IUserState>;
    public swiperConfig: SwiperConfigInterface;
    public scheduleDates: string[];
    public screeningFilmEvents: IScreeningEventFilm[];
    public moment: typeof moment = moment;
    public scheduleDate: string;
    private updateTimer: any;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router,
        private modal: NgbModal
    ) { }

    public async ngOnInit() {
        this.swiperConfig = {
            spaceBetween: 1,
            slidesPerView: 7,
            breakpoints: {
                320: { slidesPerView: 2 },
                767: { slidesPerView: 3 },
                1024: { slidesPerView: 5 }
            }
        };
        this.purchase = this.store.pipe(select(reducers.getPurchase));
        this.master = this.store.pipe(select(reducers.getMaster));
        this.user = this.store.pipe(select(reducers.getUser));
        this.cancelTemporaryReservation();
        this.screeningFilmEvents = [];
        this.scheduleDates = [];
        for (let i = 0; i < 7; i++) {
            this.scheduleDates.push(moment().add(i, 'day').format('YYYY-MM-DD'));
        }
        this.selectDate();
    }

    public ngOnDestroy() {
        clearTimeout(this.updateTimer);
    }

    private cancelTemporaryReservation() {
        this.purchase.subscribe((purchase) => {
            if (purchase.authorizeSeatReservation !== undefined) {
                const authorizeSeatReservation = purchase.authorizeSeatReservation;
                this.store.dispatch(new purchaseAction.CancelTemporaryReservation({ authorizeSeatReservation }));
            }
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.CancelTemporaryReservationSuccess),
            tap(() => {
                this.store.dispatch(new purchaseAction.UnsettledDelete());
             })
        );

        const fail = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.CancelTemporaryReservationFail),
            tap(() => { })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    private update() {
        if (this.updateTimer !== undefined) {
            clearTimeout(this.updateTimer);
        }
        const time = 600000; // 10 * 60 * 1000
        this.updateTimer = setTimeout(() => {
            this.selectDate();
        }, time);
    }

    /**
     * resize
     */
    public resize() {
        this.directiveRef.update();
    }

    /**
     * selectDate
     */
    public selectDate() {
        this.user.subscribe((user) => {
            const movieTheater = user.movieTheater;
            if (this.scheduleDate === undefined || this.scheduleDate === '') {
                this.scheduleDate = moment().format('YYYY-MM-DD');
            }
            const scheduleDate = this.scheduleDate;
            if (movieTheater === undefined) {
                return;
            }
            this.store.dispatch(new purchaseAction.SelectScheduleDate({ scheduleDate }));
            this.store.dispatch(new masterAction.GetSchedule({ movieTheater, scheduleDate }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(masterAction.ActionTypes.GetScheduleSuccess),
            tap(() => {
                this.master.subscribe((master) => {
                    const screeningEvents = master.screeningEvents;
                    this.screeningFilmEvents = screeningEventsToFilmEvents({ screeningEvents });
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

    /**
     * selectSchedule
     */
    public selectSchedule(screeningEvent: factory.chevre.event.screeningEvent.IEvent) {
        if (screeningEvent.remainingAttendeeCapacity === undefined
            || screeningEvent.remainingAttendeeCapacity === 0) {
            return;
        }
        this.store.dispatch(new purchaseAction.SelectSchedule({ screeningEvent }));
        this.purchase.subscribe((purchase) => {
            this.user.subscribe((user) => {
                if (user.movieTheater === undefined
                    || user.pos === undefined) {
                    this.router.navigate(['/error']);
                    return;
                }
                if (purchase.transaction !== undefined
                    && purchase.authorizeSeatReservations.length > 0) {
                    this.openTransactionModal(screeningEvent);
                    return;
                }
                this.store.dispatch(new purchaseAction.StartTransaction({
                    params: {
                        expires: moment().add(environment.TRANSACTION_TIME, 'minutes').toDate(),
                        seller: {
                            typeOf: user.movieTheater.typeOf,
                            id: user.movieTheater.id
                        },
                        agent: {
                            identifier: [
                                { name: 'posId', value: user.pos.id },
                                { name: 'posName', value: user.pos.name }
                            ]
                        },
                        object: {}
                    }
                }));
            }).unsubscribe();
        }).unsubscribe();


        const success = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.StartTransactionSuccess),
            tap(() => {
                this.router.navigate(['/purchase/seat']);
            })
        );

        const fail = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.StartTransactionFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public openTransactionModal(screeningEvent: factory.chevre.event.screeningEvent.IEvent) {
        const modalRef = this.modal.open(PurchaseTransactionModalComponent, {
            centered: true
        });
        modalRef.result.then(() => {
            this.store.dispatch(new purchaseAction.UnsettledDelete());
            this.store.dispatch(new purchaseAction.SelectSchedule({ screeningEvent }));
            this.router.navigate(['/purchase/seat']);
        }).catch(() => { });
    }

}
