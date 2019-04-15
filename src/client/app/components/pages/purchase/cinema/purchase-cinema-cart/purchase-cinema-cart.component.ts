import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { getAmount, getTicketPrice } from '../../../../../functions';
import { UtilService } from '../../../../../services';
import { purchaseAction } from '../../../../../store/actions';
import * as reducers from '../../../../../store/reducers';

@Component({
    selector: 'app-purchase-cinema-cart',
    templateUrl: './purchase-cinema-cart.component.html',
    styleUrls: ['./purchase-cinema-cart.component.scss']
})
export class PurchaseCinemaCartComponent implements OnInit {
    public purchase: Observable<reducers.IPurchaseState>;
    public user: Observable<reducers.IUserState>;
    public isLoading: Observable<boolean>;
    public moment: typeof moment = moment;
    public getTicketPrice = getTicketPrice;
    public amount: number;
    constructor(
        private store: Store<reducers.IState>,
        private util: UtilService,
        private actions: Actions,
        private router: Router,
        private translate: TranslateService
    ) { }

    public ngOnInit() {
        this.amount = 0;
        this.purchase = this.store.pipe(select(reducers.getPurchase));
        this.user = this.store.pipe(select(reducers.getUser));
        this.isLoading = this.store.pipe(select(reducers.getLoading));
        this.store.dispatch(new purchaseAction.UnsettledDelete());
        this.purchase.subscribe((purchase) => {
            this.amount = getAmount(purchase.authorizeSeatReservations);
        }).unsubscribe();
    }

    public removeItemProcess(
        authorizeSeatReservation: factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier>
    ) {
        this.purchase.subscribe((purchase) => {
            if (purchase.transaction === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const authorizeSeatReservations = [authorizeSeatReservation];
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
            body: '削除してよろしいですか。',
            cb: () => {
                this.removeItemProcess(authorizeSeatReservation);
            }
        });
    }

}
