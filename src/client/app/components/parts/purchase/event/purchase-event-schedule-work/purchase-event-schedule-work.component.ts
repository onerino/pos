import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import { IScreeningEventWork } from '../../../../../functions';

@Component({
    selector: 'app-purchase-event-schedule-work',
    templateUrl: './purchase-event-schedule-work.component.html',
    styleUrls: ['./purchase-event-schedule-work.component.scss']
})
export class PurchaseEventScheduleWorkComponent implements OnInit {

    @Input() public screeningWorkEvent: IScreeningEventWork;
    @Input() public readonly: boolean;
    @Output() public select = new EventEmitter<factory.chevre.event.screeningEvent.IEvent>();
    public moment: typeof moment = moment;
    constructor() { }

    public ngOnInit() { }

}
