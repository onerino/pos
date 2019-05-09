import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } from 'http-status';
import * as moment from 'moment';
import { BsModalService } from 'ngx-bootstrap';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { IScreeningEventWork, screeningEventsToWorkEvents } from '../../../../../functions';
import { UtilService } from '../../../../../services';
import { masterAction, purchaseAction } from '../../../../../store/actions';
import * as reducers from '../../../../../store/reducers';
import { PurchaseTransactionModalComponent } from '../../../../parts';

@Component({
    selector: 'app-purchase-cinema-schedule',
    templateUrl: './purchase-cinema-schedule.component.html',
    styleUrls: ['./purchase-cinema-schedule.component.scss']
})
export class PurchaseCinemaScheduleComponent implements OnInit, OnDestroy {
    public purchase: Observable<reducers.IPurchaseState>;
    public error: Observable<string | null>;
    public master: Observable<reducers.IMasterState>;
    public user: Observable<reducers.IUserState>;
    public screeningWorkEvents: IScreeningEventWork[];
    public moment: typeof moment = moment;
    public scheduleDate: string;
    private updateTimer: any;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router,
        private util: UtilService,
        private modal: BsModalService,
        private translate: TranslateService
    ) { }

    /**
     * 初期化
     */
    public async ngOnInit() {
        this.purchase = this.store.pipe(select(reducers.getPurchase));
        this.error = this.store.pipe(select(reducers.getError));
        this.master = this.store.pipe(select(reducers.getMaster));
        this.user = this.store.pipe(select(reducers.getUser));
        this.screeningWorkEvents = [];
        this.selectDate();
    }

    /**
     * 破棄
     */
    public ngOnDestroy() {
        clearTimeout(this.updateTimer);
    }

    /**
     * 仮予約削除
     */
    private async cancelTemporaryReservations() {
        return new Promise((resolve, reject) => {
            this.purchase.subscribe((purchase) => {
                const authorizeSeatReservations = purchase.authorizeSeatReservations;
                this.store.dispatch(new purchaseAction.CancelTemporaryReservations({ authorizeSeatReservations }));
            }).unsubscribe();
            const success = this.actions.pipe(
                ofType(purchaseAction.ActionTypes.CancelTemporaryReservationsSuccess),
                tap(() => { resolve(); })
            );
            const fail = this.actions.pipe(
                ofType(purchaseAction.ActionTypes.CancelTemporaryReservationsFail),
                tap(() => { this.error.subscribe((error) => reject(error)).unsubscribe(); })
            );
            race(success, fail).pipe(take(1)).subscribe();
        });
    }

    /**
     * 取引開始
     */
    private async startTransaction() {
        return new Promise((resolve, reject) => {
            this.user.subscribe((user) => {
                if (user.seller === undefined) {
                    reject(null);
                    return;
                }
                this.store.dispatch(new purchaseAction.StartTransaction({
                    params: {
                        expires: moment().add(environment.PURCHASE_TRANSACTION_TIME, 'minutes').toDate(),
                        seller: { typeOf: user.seller.typeOf, id: user.seller.id },
                        object: {}
                    }
                }));
            }).unsubscribe();
            const success = this.actions.pipe(
                ofType(purchaseAction.ActionTypes.StartTransactionSuccess),
                tap(() => { resolve(); })
            );
            const fail = this.actions.pipe(
                ofType(purchaseAction.ActionTypes.StartTransactionFail),
                tap(() => { this.error.subscribe((error) => reject(error)).unsubscribe(); })
            );
            race(success, fail).pipe(take(1)).subscribe();
        });
    }

    /**
     * 更新
     */
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
     * 日付選択
     */
    public selectDate() {
        this.user.subscribe((user) => {
            const seller = user.seller;
            if (this.scheduleDate === undefined || this.scheduleDate === '') {
                this.scheduleDate = moment()
                    .add(environment.PURCHASE_SCHEDULE_DEFAULT_SELECTED_DATE, 'day')
                    .format('YYYY-MM-DD');
            }
            const scheduleDate = this.scheduleDate;
            if (seller === undefined) {
                return;
            }
            this.store.dispatch(new purchaseAction.SelectScheduleDate({ scheduleDate }));
            this.store.dispatch(new masterAction.GetSchedule({
                superEvent: {
                    locationBranchCodes:
                        (seller.location === undefined || seller.location.branchCode === undefined) ? [] : [seller.location.branchCode]
                },
                startFrom: moment(scheduleDate).toDate(),
                startThrough: moment(scheduleDate).add(1, 'day').toDate()
            }));
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

    /**
     * スケジュール選択
     */
    public selectSchedule(screeningEvent: factory.chevre.event.screeningEvent.IEvent) {
        if (screeningEvent.remainingAttendeeCapacity === undefined
            || screeningEvent.remainingAttendeeCapacity === 0) {
            return;
        }
        if (screeningEvent.offers === undefined
            || screeningEvent.offers.itemOffered.serviceOutput === undefined
            || screeningEvent.offers.itemOffered.serviceOutput.reservedTicket === undefined
            || screeningEvent.offers.itemOffered.serviceOutput.reservedTicket.ticketedSeat === undefined) {
            this.util.openAlert({
                title: this.translate.instant('common.error'),
                body: this.translate.instant('purchase.cinema.schedule.alert.ticketedSeat')
            });
            return;
        }
        this.store.dispatch(new purchaseAction.UnsettledDelete());
        this.store.dispatch(new purchaseAction.SelectSchedule({ screeningEvent }));
        this.purchase.subscribe((purchase) => {
            this.user.subscribe(async (user) => {
                if (user.seller === undefined) {
                    this.router.navigate(['/error']);
                    return;
                }
                if (user.purchaseCartMaxLength > 1
                    && purchase.transaction !== undefined
                    && purchase.authorizeSeatReservations.length > 0) {
                    this.openTransactionModal();
                    return;
                }
                try {
                    await this.cancelTemporaryReservations();
                    await this.startTransaction();
                    this.router.navigate(['/purchase/cinema/seat']);
                } catch (error) {
                    if (error === null) {
                        throw new Error('error is null');
                    }
                    const errorObject = JSON.parse(error);
                    if (errorObject.status === TOO_MANY_REQUESTS) {
                        this.router.navigate(['/congestion']);
                        return;
                    }
                    if (errorObject.status === SERVICE_UNAVAILABLE) {
                        this.router.navigate(['/maintenance']);
                        return;
                    }
                    this.router.navigate(['/error']);
                }
            }).unsubscribe();
        }).unsubscribe();
    }

    /**
     * 取引重複モーダル表示
     */
    public openTransactionModal() {
        this.purchase.subscribe((purchase) => {
            this.user.subscribe((user) => {
                this.modal.show(PurchaseTransactionModalComponent, {
                    class: 'modal-dialog-centered',
                    initialState: {
                        purchase, user,
                        cb: () => {
                            this.router.navigate(['/purchase/cinema/seat']);
                        }
                    }
                });
            }).unsubscribe();
        }).unsubscribe();
    }

}
