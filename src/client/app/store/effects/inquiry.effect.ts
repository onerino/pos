import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, mergeMap } from 'rxjs/operators';
import { formatTelephone } from '../../functions';
import { CinerinoService, StarPrintService, UtilService } from '../../services';
import * as inquiry from '../actions/inquiry.action';

/**
 * Inquiry Effects
 */
@Injectable()
export class InquiryEffects {

    constructor(
        private actions: Actions,
        private cinerino: CinerinoService,
        private starPrint: StarPrintService,
        private util: UtilService
    ) { }

    /**
     * Inquiry
     */
    @Effect()
    public load = this.actions.pipe(
        ofType<inquiry.Inquiry>(inquiry.ActionTypes.Inquiry),
        map(action => action.payload),
        mergeMap(async (payload) => {
            await this.cinerino.getServices();
            const confirmationNumber = payload.confirmationNumber;
            const customer = {
                telephone: (payload.customer.telephone === undefined)
                    ? '' : formatTelephone(payload.customer.telephone)
            };
            try {
                const order = await this.cinerino.order.findByConfirmationNumber({
                    confirmationNumber, customer
                });

                return new inquiry.InquirySuccess({ order });
            } catch (error) {
                return new inquiry.InquiryFail({ error: error });
            }
        })
    );

    /**
     * print
     */
    @Effect()
    public print = this.actions.pipe(
        ofType<inquiry.Print>(inquiry.ActionTypes.Print),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const order = payload.order;
                const ipAddress = payload.ipAddress;
                const pos = payload.pos;
                const timeout = 60000;
                this.starPrint.initialize({ ipAddress, pos, timeout });
                let printerRequests;
                if (order === undefined) {
                    printerRequests = await this.starPrint.createPrinterTestRequest();
                } else {
                    printerRequests = await this.starPrint.createPrinterRequestList({ order });
                }
                // n分割配列へ変換
                const divide = 4;
                const divideRequests: string[] = [];
                let divideRequest = '';
                printerRequests.forEach((request, index) => {
                    divideRequest += request;
                    if ((index + 1) % divide === 0) {
                        divideRequests.push(divideRequest);
                        divideRequest = '';
                    }
                });
                if (divideRequest !== '') {
                    divideRequests.push(divideRequest);
                }
                for (const printerRequest of divideRequests) {
                    // safari対応のため0.3秒待つ
                    await this.util.sleep(300);
                    await this.starPrint.print({ printerRequest });
                }

                return new inquiry.PrintSuccess();
            } catch (error) {
                return new inquiry.PrintFail({ error: error });
            }
        })
    );

    /**
     * getPurchaseHistory
     */
    @Effect()
    public getPurchaseHistory = this.actions.pipe(
        ofType<inquiry.GetPurchaseHistory>(inquiry.ActionTypes.GetPurchaseHistory),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const params = Object.assign({ personId: 'me' }, payload.params);
                await this.cinerino.getServices();
                const searchOrdersResult = await this.cinerino.person.searchOrders(params);
                const orders = searchOrdersResult.data;
                return new inquiry.GetPurchaseHistorySuccess({ result: orders });
            } catch (error) {
                return new inquiry.GetPurchaseHistoryFail({ error: error });
            }
        })
    );

    /**
     * orderAuthorize
     */
    @Effect()
    public orderAuthorize = this.actions.pipe(
        ofType<inquiry.OrderAuthorize>(inquiry.ActionTypes.OrderAuthorize),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const params = Object.assign({ personId: 'me' }, payload.params);
                await this.cinerino.getServices();
                const order = await this.cinerino.order.authorizeOwnershipInfos(params);
                return new inquiry.OrderAuthorizeSuccess({ order });
            } catch (error) {
                return new inquiry.OrderAuthorizeFail({ error: error });
            }
        })
    );
}
