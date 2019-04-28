import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, mergeMap } from 'rxjs/operators';
import { CinerinoService } from '../../services';
import { reservationAction } from '../actions';

/**
 * Reservation Effects
 */
@Injectable()
export class ReservationEffects {

    constructor(
        private actions: Actions,
        private cinerino: CinerinoService) { }

    /**
     * Search
     */
    @Effect()
    public search = this.actions.pipe(
        ofType<reservationAction.Search>(reservationAction.ActionTypes.Search),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                await this.cinerino.getServices();
                const params = payload.params;
                // if (params.customer !== undefined
                //     && params.customer.telephone !== undefined) {
                //     params.customer.telephone = formatTelephone(params.customer.telephone)
                // }
                const searchResult = await this.cinerino.reservation.search(params);
                const limit = <number>params.limit;
                return new reservationAction.SearchSuccess({ searchResult, limit });
            } catch (error) {
                return new reservationAction.SearchFail({ error: error });
            }
        })
    );

}
