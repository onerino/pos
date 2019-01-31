import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { getTicketPrice, IEventOrder, orderToEventOrders } from '../../../../functions';
import { ActionTypes, Print } from '../../../../store/actions/inquiry.action';
import * as reducers from '../../../../store/reducers';
import { AlertModalComponent } from '../../../parts/alert-modal/alert-modal.component';

@Component({
    selector: 'app-inquiry-confirm',
    templateUrl: './inquiry-confirm.component.html',
    styleUrls: ['./inquiry-confirm.component.scss']
})
export class InquiryConfirmComponent implements OnInit {
    public inquiry: Observable<reducers.IInquiryState>;
    public user: Observable<reducers.IUserState>;
    public isLoading: Observable<boolean>;
    public error: Observable<string | null>;
    public moment: typeof moment = moment;
    public getTicketPrice = getTicketPrice;
    public eventOrders: IEventOrder[];

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router,
        private modal: NgbModal
    ) { }

    public ngOnInit() {
        this.eventOrders = [];
        this.inquiry = this.store.pipe(select(reducers.getInquiry));
        this.user = this.store.pipe(select(reducers.getUser));
        this.isLoading = this.store.pipe(select(reducers.getLoading));
        this.error = this.store.pipe(select(reducers.getError));
        this.inquiry.subscribe((inquiry) => {
            if (inquiry.order === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const order = inquiry.order;
            this.eventOrders = orderToEventOrders({ order });
        });
    }

    public print() {
        this.inquiry.subscribe((inquiry) => {
            this.user.subscribe((user) => {
                if (inquiry.order === undefined
                    || user.pos === undefined
                    || user.printer === undefined) {
                    this.router.navigate(['/error']);
                    return;
                }
                const order = inquiry.order;
                const pos = user.pos;
                const printer = user.printer;
                this.store.dispatch(new Print({ order, pos, printer }));
            }).unsubscribe();
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.PrintSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.PrintFail),
            tap(() => {
                this.error.subscribe((error) => {
                    this.openAlert({
                        title: 'エラー',
                        body: `
                        <p class="mb-4">印刷に失敗しました</p>
                            <div class="p-3 bg-light-gray select-text">
                            <code>${error}</code>
                        </div>`
                    });
                }).unsubscribe();
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

}
