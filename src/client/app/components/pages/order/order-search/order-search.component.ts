import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { IOrderSearchConditions, OrderActions } from '../../../../models';
import { UtilService } from '../../../../services';
import { orderAction } from '../../../../store/actions';
import * as reducers from '../../../../store/reducers';
import { OrderDetailModalComponent, QrCodeModalComponent } from '../../../parts';

@Component({
    selector: 'app-order-search',
    templateUrl: './order-search.component.html',
    styleUrls: ['./order-search.component.scss']
})
export class OrderSearchComponent implements OnInit {
    public isLoading: Observable<boolean>;
    public error: Observable<string | null>;
    public order: Observable<reducers.IOrderState>;
    public user: Observable<reducers.IUserState>;
    public moment: typeof moment = moment;
    public orderStatus: typeof factory.orderStatus = factory.orderStatus;
    public limit: number;
    public conditions: IOrderSearchConditions;
    public confirmedConditions: IOrderSearchConditions;
    public selectedOrders: factory.order.IOrder[];
    public OrderActions: typeof OrderActions = OrderActions;
    public actionSelect: OrderActions | '';

    constructor(
        private store: Store<reducers.IOrderState>,
        private actions: Actions,
        private modal: NgbModal,
        private router: Router,
        private util: UtilService,
        private translate: TranslateService
    ) { }

    public ngOnInit() {
        this.actionSelect = '';
        this.selectedOrders = [];
        this.isLoading = this.store.pipe(select(reducers.getLoading));
        this.error = this.store.pipe(select(reducers.getError));
        this.order = this.store.pipe(select(reducers.getOrder));
        this.user = this.store.pipe(select(reducers.getUser));
        this.limit = 20;
        this.conditions = {
            orderDateFrom: '',
            orderDateThrough: '',
            confirmationNumber: '',
            orderNumber: '',
            customer: {
                familyName: '',
                givenName: '',
                email: '',
                telephone: ''
            },
            orderStatuses: '',
            page: 1
        };
        this.store.dispatch(new orderAction.Delete());
    }

    public isSelected(order: factory.order.IOrder) {
        const findResult = this.selectedOrders.find(o => o.orderNumber === order.orderNumber);
        return findResult !== undefined;
    }

    public addOrder(order: factory.order.IOrder) {
        this.selectedOrders.push(order);
    }

    public removeOrder(order: factory.order.IOrder) {
        const findIndex = this.selectedOrders.findIndex(o => o.orderNumber === order.orderNumber);
        this.selectedOrders.splice(findIndex, 1);
    }

    /**
     * 検索
     */
    public orderSearch(changeConditions: boolean) {
        this.selectedOrders = [];
        if (changeConditions) {
            this.confirmedConditions = {
                orderDateFrom: this.conditions.orderDateFrom,
                orderDateThrough: this.conditions.orderDateThrough,
                confirmationNumber: this.conditions.confirmationNumber,
                orderNumber: this.conditions.orderNumber,
                customer: {
                    familyName: this.conditions.customer.familyName,
                    givenName: this.conditions.customer.givenName,
                    email: this.conditions.customer.email,
                    telephone: this.conditions.customer.telephone
                },
                orderStatuses: this.conditions.orderStatuses,
                page: 1
            };
        }
        this.user.subscribe((user) => {
            this.store.dispatch(new orderAction.Search({
                params: {
                    seller: {
                        typeOf: (user.seller === undefined)
                            ? undefined : user.seller.typeOf,
                        ids: (user.seller === undefined)
                            ? undefined : [user.seller.id]
                    },
                    customer: {
                        email: (this.confirmedConditions.customer.email === '')
                            ? undefined : this.confirmedConditions.customer.email,
                        telephone: (this.confirmedConditions.customer.telephone === '')
                            ? undefined : this.confirmedConditions.customer.telephone,
                        familyName: (this.confirmedConditions.customer.familyName === '')
                            ? undefined : this.confirmedConditions.customer.familyName,
                        givenName: (this.confirmedConditions.customer.givenName === '')
                            ? undefined : this.confirmedConditions.customer.givenName,
                    },
                    orderStatuses: (this.confirmedConditions.orderStatuses === '')
                        ? undefined : [this.confirmedConditions.orderStatuses],
                    orderDateFrom: (this.confirmedConditions.orderDateFrom === '')
                        ? undefined : moment(this.confirmedConditions.orderDateFrom).toDate(),
                    orderDateThrough: (this.confirmedConditions.orderDateThrough === '')
                        ? undefined : moment(this.confirmedConditions.orderDateThrough).add(1, 'day').toDate(),
                    confirmationNumbers: (this.confirmedConditions.confirmationNumber === '')
                        ? undefined : [this.confirmedConditions.confirmationNumber],
                    orderNumbers: (this.confirmedConditions.orderNumber === '')
                        ? undefined : [this.confirmedConditions.orderNumber],
                    limit: this.limit,
                    page: this.confirmedConditions.page,
                    sort: {
                        orderDate: factory.sortType.Descending
                    }
                }
            }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(orderAction.ActionTypes.SearchSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(orderAction.ActionTypes.SearchFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    /**
     * 印刷確認
     */
    public printConfirm(orders: factory.order.IOrder[]) {
        this.util.openConfirm({
            title: this.translate.instant('common.confirm'),
            body: this.translate.instant('order.search.confirm.print'),
            cb: () => {
                this.ptint(orders);
            }
        });
    }

    /**
     * キャンセル確認
     */
    public cancelConfirm(orders: factory.order.IOrder[]) {
        this.util.openConfirm({
            title: this.translate.instant('common.confirm'),
            body: this.translate.instant('order.search.confirm.cancel'),
            cb: () => {
                this.cancel(orders);
            }
        });
    }

    /**
     * 詳細を表示
     */
    public openDetail(order: factory.order.IOrder) {
        const modalRef = this.modal.open(OrderDetailModalComponent, {
            centered: true,
            size: 'lg'
        });
        modalRef.componentInstance.order = order;
    }

    /**
     * キャンセル処理
     */
    public cancel(orders: factory.order.IOrder[]) {
        this.store.dispatch(new orderAction.Cancel({ orders }));

        const success = this.actions.pipe(
            ofType(orderAction.ActionTypes.CancelSuccess),
            tap(() => {
                this.orderSearch(false);
            })
        );

        const fail = this.actions.pipe(
            ofType(orderAction.ActionTypes.CancelFail),
            tap(() => {
                this.error.subscribe((error) => {
                    this.util.openAlert({
                        title: this.translate.instant('common.error'),
                        body: `
                        <p class="mb-4">${this.translate.instant('order.search.alert.cancel')}</p>
                            <div class="p-3 bg-light-gray select-text">
                            <code>${error}</code>
                        </div>`
                    });
                }).unsubscribe();
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    /**
     * 印刷処理
     */
    public ptint(orders: factory.order.IOrder[]) {
        this.user.subscribe((user) => {
            if (user.pos === undefined
                || user.printer === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const pos = user.pos;
            const printer = user.printer;
            this.store.dispatch(new orderAction.Print({ orders, pos, printer }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(orderAction.ActionTypes.PrintSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(orderAction.ActionTypes.PrintFail),
            tap(() => {
                this.error.subscribe((error) => {
                    this.util.openAlert({
                        title: this.translate.instant('common.error'),
                        body: `<p class="mb-4">${this.translate.instant('order.search.alert.print')}</p>
                        <div class="p-3 bg-light-gray select-text">
                        <code>${error}</code>
                    </div>`
                    });
                }).unsubscribe();
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    /**
     * 選択した注文へのアクション
     */
    public selecedtAction() {
        if (this.selectedOrders.length === 0) {
            this.util.openAlert({
                title: this.translate.instant('common.error'),
                body: this.translate.instant('order.search.alert.unselected')
            });
        }
        if (this.actionSelect === OrderActions.Cancel) {
            this.util.openConfirm({
                title: this.translate.instant('common.confirm'),
                body: this.translate.instant('order.search.alert.cancel'),
                cb: () => {
                    this.cancel(this.selectedOrders);
                }
            });
        } else if (this.actionSelect === OrderActions.Print) {
            this.util.openConfirm({
                title: this.translate.instant('common.confirm'),
                body: this.translate.instant('order.search.alert.print'),
                cb: () => {
                    this.ptint(this.selectedOrders);
                }
            });
        }
    }

    /**
     * QRコード表示
     */
    public openQrCode(order: factory.order.IOrder) {
        this.store.dispatch(new orderAction.OrderAuthorize({
            params: {
                orderNumber: order.orderNumber,
                customer: {
                    telephone: order.customer.telephone
                }
            }
        }));
        const success = this.actions.pipe(
            ofType(orderAction.ActionTypes.OrderAuthorizeSuccess),
            tap(() => {
                this.order.subscribe((orderData) => {
                    const authorizeOrder = orderData.order;
                    if (authorizeOrder === undefined) {
                        return;
                    }
                    const modalRef = this.modal.open(QrCodeModalComponent, {
                        centered: true
                    });
                    modalRef.componentInstance.order = authorizeOrder;
                }).unsubscribe();
            })
        );
        const fail = this.actions.pipe(
            ofType(orderAction.ActionTypes.OrderAuthorizeFail),
            tap(() => {
                this.util.openAlert({
                    title: this.translate.instant('common.error'),
                    body: this.translate.instant('order.search.alert.authorize')
                });
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

}
