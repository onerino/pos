import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import { IScreeningEventFilm } from '../../../functions';

@Component({
    selector: 'app-admission-schedule-film',
    templateUrl: './admission-schedule-film.component.html',
    styleUrls: ['./admission-schedule-film.component.scss']
})
export class AdmissionScheduleFilmComponent implements OnInit {

    @Input() public screeningFilmEvent: IScreeningEventFilm;
    @Output() public select = new EventEmitter<factory.chevre.event.screeningEvent.IEvent>();
    public moment: typeof moment = moment;
    constructor() { }

    public ngOnInit() { }

}
