import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, mergeMap } from 'rxjs/operators';
import { CinerinoService } from '../../services';
import * as orderAction from '../actions/order.action';

/**
 * Order Effects
 */
@Injectable()
export class OrderEffects {

    constructor(
        private actions: Actions,
        private cinerino: CinerinoService
    ) { }

    /**
     * Search
     */
    @Effect()
    public search = this.actions.pipe(
        ofType<orderAction.Search>(orderAction.ActionTypes.Search),
        map(action => action.payload),
        mergeMap(async (payload) => {
            await this.cinerino.getServices();
            const params = payload.params;
            try {
                // if (params.customer !== undefined
                //     && params.customer.telephone !== undefined) {
                //     params.customer.telephone = formatTelephone(params.customer.telephone)
                // }
                const searchResult = await this.cinerino.order.search(params);

                return new orderAction.SearchSuccess({ searchResult });
            } catch (error) {
                return new orderAction.SearchFail({ error: error });
            }
        })
    );

    /**
     * Cancel
     */
    @Effect()
    public cancel = this.actions.pipe(
        ofType<orderAction.Cancel>(orderAction.ActionTypes.Cancel),
        map(action => action.payload),
        mergeMap(async (payload) => {
            await this.cinerino.getServices();
            const order = payload.order;
            try {
                console.log(order);
                return new orderAction.CancelSuccess();
            } catch (error) {
                return new orderAction.CancelFail({ error: error });
            }
        })
    );

}
