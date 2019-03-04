import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import { IScreeningEventWork } from '../../../functions';

@Component({
    selector: 'app-admission-schedule-work',
    templateUrl: './admission-schedule-work.component.html',
    styleUrls: ['./admission-schedule-work.component.scss']
})
export class AdmissionScheduleWorkComponent implements OnInit {

    @Input() public screeningWorkEvent: IScreeningEventWork;
    @Output() public select = new EventEmitter<factory.chevre.event.screeningEvent.IEvent>();
    public moment: typeof moment = moment;
    constructor() { }

    public ngOnInit() { }

}
