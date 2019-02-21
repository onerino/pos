import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import { map, mergeMap } from 'rxjs/operators';
import { createPrintImage, createTestPrintImage, formatTelephone, retry } from '../../functions';
import { connectionType } from '../../models';
import { CinerinoService, StarPrintService, UtilService } from '../../services';
import * as orderAction from '../actions/order.action';

/**
 * Order Effects
 */
@Injectable()
export class OrderEffects {

    constructor(
        private actions: Actions,
        private cinerino: CinerinoService,
        private starPrint: StarPrintService,
        private util: UtilService
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
                const limit = <number>params.limit;
                return new orderAction.SearchSuccess({ searchResult, limit });
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
            const orders = payload.orders;
            try {
                await this.cinerino.getServices();
                for (const order of orders) {
                    const startResult = await this.cinerino.transaction.returnOrder.start({
                        expires: moment().add(1, 'day').toDate(),
                        object: {
                            order: {
                                orderNumber: order.orderNumber,
                                customer: {
                                    telephone: order.customer.telephone,
                                    // email: order.customer.email
                                }
                            }
                        }
                    });
                    await this.cinerino.transaction.returnOrder.confirm({ id: startResult.id });
                }
                const orderStatusWatch = () => {
                    return new Promise<void>((resolve, reject) => {
                        const interval = 5000;
                        let intervalCount = 0;
                        const limit = 10;
                        const timer = setInterval(async () => {
                            const searchResult = await this.cinerino.order.search({
                                orderNumbers: orders.map(o => o.orderNumber)
                            });
                            const filterResult = searchResult.data.filter(o => o.orderStatus !== factory.orderStatus.OrderReturned);
                            if (filterResult.length === 0) {
                                clearInterval(timer);
                                return resolve();
                            }
                            if (intervalCount > limit) {
                                clearInterval(timer);
                                return reject({error: 'timeout'});
                            }
                            intervalCount++;
                        }, interval);
                    });
                };
                await orderStatusWatch();

                return new orderAction.CancelSuccess();
            } catch (error) {
                return new orderAction.CancelFail({ error: error });
            }
        })
    );

    /**
     * inquiry
     */
    @Effect()
    public inquiry = this.actions.pipe(
        ofType<orderAction.Inquiry>(orderAction.ActionTypes.Inquiry),
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

                return new orderAction.InquirySuccess({ order });
            } catch (error) {
                return new orderAction.InquiryFail({ error: error });
            }
        })
    );

    /**
     * print
     */
    @Effect()
    public print = this.actions.pipe(
        ofType<orderAction.Print>(orderAction.ActionTypes.Print),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const orders = payload.orders;
                const printer = payload.printer;
                const pos = payload.pos;
                await this.cinerino.getServices();
                const authorizeOrders: factory.order.IOrder[] = [];
                for (const order of orders) {
                    const result = await retry<factory.order.IOrder>({
                        process: (async () => {
                            const orderNumber = order.orderNumber;
                            const customer = {
                                // email: args.order.customer.email,
                                telephone: order.customer.telephone
                            };
                            const authorizeOrder = await this.cinerino.order.authorizeOwnershipInfos({ orderNumber, customer });

                            return authorizeOrder;
                        }),
                        interval: 5000,
                        limit: 5
                    });

                    authorizeOrders.push(result);
                }

                switch (printer.connectionType) {
                    case connectionType.StarBluetooth:
                        await this.starPrint.printProcess({ orders: authorizeOrders, printer, pos });
                        break;
                    case connectionType.StarLAN:
                        await this.starPrint.printProcess({ orders: authorizeOrders, printer, pos });
                        break;
                    case connectionType.Image:
                        const images: string[] = [];
                        if (authorizeOrders.length > 0) {
                            for (const authorizeOrder of authorizeOrders) {
                                for (let i = 0; i < authorizeOrder.acceptedOffers.length; i++) {
                                    const canvas = await createPrintImage({ order: authorizeOrder, offerIndex: i });
                                    const image = canvas.toDataURL();
                                    images.push(image);
                                }
                            }
                        } else {
                            const canvas = await createTestPrintImage();
                            const image = canvas.toDataURL();
                            images.push(image);
                        }

                        const domList = images.map(image => `<div class="mb-3 p-4 border border-light-gray shadow-sm">
                        <img class="w-100" src="${image}">
                        </div>`);

                        this.util.openAlert({
                            title: '',
                            body: `<div class="px-5">${domList.join('\n')}</div>`
                        });

                        break;
                    default:
                        break;
                }

                return new orderAction.PrintSuccess();
            } catch (error) {
                return new orderAction.PrintFail({ error: error });
            }
        })
    );

    /**
     * orderAuthorize
     */
    @Effect()
    public orderAuthorize = this.actions.pipe(
        ofType<orderAction.OrderAuthorize>(orderAction.ActionTypes.OrderAuthorize),
        map(action => action.payload),
        mergeMap(async (payload) => {
            try {
                const params = Object.assign({ personId: 'me' }, payload.params);
                await this.cinerino.getServices();
                const order = await this.cinerino.order.authorizeOwnershipInfos(params);
                return new orderAction.OrderAuthorizeSuccess({ order });
            } catch (error) {
                return new orderAction.OrderAuthorizeFail({ error: error });
            }
        })
    );

}
