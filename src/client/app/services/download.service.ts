import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as json2csv from 'json2csv';
import * as moment from 'moment';
import { environment } from '../../environments/environment';
import { formatTelephone, getTicketPrice } from '../functions';
import { CinerinoService } from './cinerino.service';
import { UtilService } from './util.service';

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    constructor(
        private cinerino: CinerinoService,
        private util: UtilService
    ) { }

    /**
     * 注文情報CSVダウンロード
     */
    public async order(params: factory.order.ISearchConditions) {
        const url = `${environment.PROJECT_ID}/json/csv/order.json`;
        const fields = await this.util.getJson<{ label: string, value: string }[]>(url);
        const opts = { fields, unwind: [] };
        await this.cinerino.getServices();
        const limit = 100;
        let page = 1;
        let roop = true;
        let orders: factory.order.IOrder[] = [];
        while (roop) {
            params.limit = limit;
            params.page = page;
            const searchResult = await this.cinerino.order.search(params);
            orders = orders.concat(searchResult.data);
            const lastPage = Math.ceil(searchResult.totalCount / limit);
            page++;
            roop = !(page > lastPage);
        }
        const data: any[] = [];
        orders.forEach((order) => {
            order.acceptedOffers.forEach((acceptedOffer) => {
                if (acceptedOffer.itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
                    return;
                }
                const customData = {
                    orderDate: order.orderDate,
                    orderDateJST: moment(order.orderDate).format('YYYY/MM/DD/HH:mm'),
                    orderNumber: order.orderNumber,
                    orderStatus: order.orderStatus,
                    confirmationNumber: order.confirmationNumber,
                    price: order.price,
                    seller: order.seller,
                    paymentMethodsNames: order.paymentMethods.map(m => m.name).join(','),
                    customer: {
                        ...order.customer,
                        formatTelephone: formatTelephone((<string>order.customer.telephone))
                    },
                    itemOffered: {
                        id: acceptedOffer.itemOffered.id,
                        price: getTicketPrice(acceptedOffer).total,
                        reservedTicket: acceptedOffer.itemOffered.reservedTicket,
                        reservationFor: {
                            ...acceptedOffer.itemOffered.reservationFor,
                            startDateJST: moment(acceptedOffer.itemOffered.reservationFor.startDate).format('YYYY/MM/DD/HH:mm')
                        }
                    }
                };
                data.push(customData);
            });
        });
        await this.splitDownload(data, opts, 1000);
    }

    /**
     * 予約情報CSVダウンロード
     */
    public async reservation(params: factory.chevre.reservation.ISearchConditions<factory.chevre.reservationType.EventReservation>) {
        const url = `${environment.PROJECT_ID}/json/csv/reservation.json`;
        const fields = await this.util.getJson<{ label: string, value: string }[]>(url);
        const opts = { fields, unwind: [] };
        await this.cinerino.getServices();
        const limit = 100;
        let page = 1;
        let roop = true;
        let reservations: factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>[] = [];
        while (roop) {
            params.limit = limit;
            params.page = page;
            const searchResult = await this.cinerino.reservation.search(params);
            reservations = reservations.concat(searchResult.data);
            const lastPage = Math.ceil(searchResult.totalCount / limit);
            page++;
            roop = !(page > lastPage);
        }

        const data: any[] = [];
        reservations.forEach((reservation) => {
            const customData = {
                bookingTime: reservation.bookingTime,
                bookingTimeJST: moment(reservation.bookingTime).format('YYYY/MM/DD/HH:mm'),
                id: reservation.id,
                reservationNumber: reservation.reservationNumber,
                reservationStatus: reservation.reservationStatus,
                price: (typeof reservation.price === 'number' || reservation.price === undefined)
                    ? reservation.price
                    : getTicketPrice(<any>{ priceSpecification: { priceComponent: reservation.price.priceComponent } }).total,
                reservedTicket: reservation.reservedTicket,
                reservationFor: {
                    ...reservation.reservationFor,
                    startDateJST: moment(reservation.reservationFor.startDate).format('YYYY/MM/DD/HH:mm')
                },
                checkedIn: reservation.checkedIn,
                attended: reservation.attended
            };
            data.push(customData);
        });
        await this.splitDownload(data, opts, 1000);
    }

    private async splitDownload(data: any, opts: any, split: number) {
        const limit = Math.ceil(data.length / split);
        for (let i = 0; i < limit; i++) {
            const splitData = data.slice(i * split, ((i + 1) * split > data.length) ? data.length : (i + 1) * split);
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const csv = await json2csv.parseAsync(splitData, opts);
            const blob = new Blob([bom, csv], { 'type': 'text/csv' });
            this.download(blob, `reservation${(limit > 1) ? `_${(i + 1)}` : ''}.csv`);
        }
    }

    private download(blob: Blob, fileName: string) {
        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, fileName);
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        }
    }
}
