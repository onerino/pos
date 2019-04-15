import { Component, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { purchaseAction } from '../../../../store/actions';
import * as reducers from '../../../../store/reducers';

@Component({
    selector: 'app-development-screen',
    templateUrl: './development-screen.component.html',
    styleUrls: ['./development-screen.component.scss']
})
export class DevelopmentScreenComponent implements OnInit {
    public purchase: Observable<reducers.IPurchaseState>;
    public table: { theaterCode: string; screens: string[]; }[];
    public environment = environment;
    public theaterCode: string;
    public screenCode: string;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions
    ) { }

    public ngOnInit() {
        this.purchase = this.store.pipe(select(reducers.getPurchase));
        this.table = this.createTable();
        this.theaterCode = this.table[0].theaterCode;
        this.screenCode = this.table[0].screens[0];
        this.getScreenData();
    }

    public getScreenData() {
        const theaterCode = this.theaterCode;
        const screenCode = this.screenCode;
        this.store.dispatch(new purchaseAction.GetScreen({ test: true, theaterCode, screenCode }));

        const success = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.GetScreenSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(purchaseAction.ActionTypes.GetScreenFail),
            tap(() => { })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }


    private createTable() {
        return [
            { theaterCode: '118', screens: ['010', '020', '030', '040', '050', '060', '070', '080', '090'] },
            { theaterCode: '002', screens: ['010', '020', '030', '040', '050', '060', '070', '080', '090'] }
        ];
    }

    public getScreens(theaterCode: string) {
        const findResult = this.table.find(t => t.theaterCode === theaterCode);
        return (findResult === undefined) ? this.table[0] : findResult;
    }

    public changeTheaterCode() {
        this.screenCode = this.getScreens(this.theaterCode).screens[0];
    }

}
