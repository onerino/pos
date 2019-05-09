import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import { BsModalRef } from 'ngx-bootstrap';
import { environment } from '../../../../environments/environment';
import { getTicketPrice } from '../../../functions';

@Component({
    selector: 'app-reservation-detail-modal',
    templateUrl: './reservation-detail-modal.component.html',
    styleUrls: ['./reservation-detail-modal.component.scss']
})
export class ReservationDetailModalComponent implements OnInit {
    @Input() public reservation: factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>;
    public moment: typeof moment = moment;
    public getTicketPrice = getTicketPrice;
    public environment = environment;

    constructor(
        public modal: BsModalRef,
        private elementRef: ElementRef
    ) { }

    public ngOnInit() {
        const element: HTMLElement = this.elementRef.nativeElement.querySelector('.scroll-vertical');
        setTimeout(() => {
            element.scrollTop = 0;
        }, 0);
    }

}
