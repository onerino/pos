import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { ActionTypes, Cancel, Delete, Search } from '../../../../store/actions/order.action';
import * as reducers from '../../../../store/reducers';
import { AlertModalComponent } from '../../../parts/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from '../../../parts/confirm-modal/confirm-modal.component';
import { OrderDetailModalComponent } from '../../../parts/order-detail-modal/order-detail-modal.component';

@Component({
    selector: 'app-order-list',
    templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
    public isLoading: Observable<boolean>;
    public order: Observable<reducers.IOrderState>;
    public user: Observable<reducers.IUserState>;
    public moment: typeof moment = moment;
    public orderStatus: typeof factory.orderStatus = factory.orderStatus;
    public limit: number;
    public conditions: {
        orderDateFrom: string;
        orderDateThrough: string;
        confirmationNumber: string;
        customer: {
            familyName: string;
            givenName: string;
            email: string;
            telephone: string;
        },
        orderStatuses: '' | factory.orderStatus;
    };

    constructor(
        private store: Store<reducers.IOrderState>,
        private actions: Actions,
        private modal: NgbModal,
        private router: Router
    ) { }

    public ngOnInit() {
        this.isLoading = this.store.pipe(select(reducers.getLoading));
        this.order = this.store.pipe(select(reducers.getOrder));
        this.user = this.store.pipe(select(reducers.getUser));
        this.limit = 20;
        this.conditions = {
            orderDateFrom: '',
            orderDateThrough: '',
            confirmationNumber: '',
            customer: {
                familyName: '',
                givenName: '',
                email: '',
                telephone: ''
            },
            orderStatuses: ''
        };
        this.store.dispatch(new Delete());
    }

    public pageChange(event: any) {
        console.log(event);
    }

    public orderSearch(page: number) {
        this.user.subscribe((user) => {
            this.store.dispatch(new Search({
                params: {
                    seller: {
                        typeOf: (user.movieTheater === undefined)
                            ? undefined : user.movieTheater.typeOf,
                        ids: (user.movieTheater === undefined)
                            ? undefined : [user.movieTheater.id]
                    },
                    customer: {
                        email: (this.conditions.customer.email === '')
                            ? undefined : this.conditions.customer.email,
                        telephone: (this.conditions.customer.telephone === '')
                            ? undefined : this.conditions.customer.telephone,
                        familyName: (this.conditions.customer.familyName === '')
                            ? undefined : this.conditions.customer.familyName,
                        givenName: (this.conditions.customer.givenName === '')
                            ? undefined : this.conditions.customer.givenName,
                    },
                    orderStatuses: (this.conditions.orderStatuses === '')
                        ? undefined : [this.conditions.orderStatuses],
                    orderDateFrom: (this.conditions.orderDateFrom === '')
                        ? undefined : moment(this.conditions.orderDateFrom).toDate(),
                    orderDateThrough: (this.conditions.orderDateThrough === '')
                        ? undefined : moment(this.conditions.orderDateThrough).add(1, 'day').toDate(),
                    confirmationNumbers: (this.conditions.confirmationNumber === '')
                        ? undefined : [this.conditions.confirmationNumber],
                    limit: this.limit,
                    page,
                    sort: {
                        orderDate: factory.sortType.Descending
                    }
                }
            }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.SearchSuccess),
            tap(() => {
                this.order.subscribe((order) => {
                    console.log(order);
                }).unsubscribe();
            })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.SearchFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public openAlert(args: {
        title: string;
        body: string;
    }) {
        const modalRef = this.modal.open(AlertModalComponent, {
            centered: true
        });
        modalRef.componentInstance.title = args.title;
        modalRef.componentInstance.body = args.body;
    }

    public openConfirm(order: factory.order.IOrder) {
        const modalRef = this.modal.open(ConfirmModalComponent, {
            centered: true
        });
        modalRef.componentInstance.title = '確認';
        modalRef.componentInstance.body = 'キャンセルしてよろしいですか。';
        modalRef.result.then(() => {
            this.cancelOrder(order);
        }).catch(() => { });
    }

    public openDetail(order: factory.order.IOrder) {
        const modalRef = this.modal.open(OrderDetailModalComponent, {
            centered: true
        });
        modalRef.componentInstance.order = order;
    }

    public cancelOrder(order: factory.order.IOrder) {
        this.store.dispatch(new Cancel({ order }));

        const success = this.actions.pipe(
            ofType(ActionTypes.SearchSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.SearchFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

}
