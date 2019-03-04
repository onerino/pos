import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { SwiperComponent, SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { IScreeningEventWork, screeningEventsToWorkEvents } from '../../../../functions';
import * as admissionAction from '../../../../store/actions/admission.action';
import * as masterAction from '../../../../store/actions/master.action';
import * as reducers from '../../../../store/reducers';


@Component({
    selector: 'app-admission-schedule',
    templateUrl: './admission-schedule.component.html',
    styleUrls: ['./admission-schedule.component.scss']
  })
  export class AdmissionScheduleComponent implements OnInit, OnDestroy {
    @ViewChild(SwiperComponent) public componentRef: SwiperComponent;
    @ViewChild(SwiperDirective) public directiveRef: SwiperDirective;
    public admission: Observable<reducers.IAdmissionState>;
    public master: Observable<reducers.IMasterState>;
    public user: Observable<reducers.IUserState>;
    public swiperConfig: SwiperConfigInterface;
    public scheduleDates: string[];
    public screeningWorkEvents: IScreeningEventWork[];
    public moment: typeof moment = moment;
    public scheduleDate: string;
    private updateTimer: any;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router
    ) { }

    public async ngOnInit() {
        this.swiperConfig = {
            spaceBetween: 1,
            slidesPerView: 7,
            breakpoints: {
                320: { slidesPerView: 2 },
                767: { slidesPerView: 3 },
                1024: { slidesPerView: 5 }
            }
        };
        this.admission = this.store.pipe(select(reducers.getAdmission));
        this.master = this.store.pipe(select(reducers.getMaster));
        this.user = this.store.pipe(select(reducers.getUser));
        this.screeningWorkEvents = [];
        this.scheduleDates = [];
        for (let i = 0; i < 7; i++) {
            this.scheduleDates.push(moment().add(i, 'day').format('YYYY-MM-DD'));
        }
        this.selectDate();
    }

    public ngOnDestroy() {
        clearTimeout(this.updateTimer);
    }

    private update() {
        if (this.updateTimer !== undefined) {
            clearTimeout(this.updateTimer);
        }
        const time = 600000; // 10 * 60 * 1000
        this.updateTimer = setTimeout(() => {
            this.selectDate();
        }, time);
    }

    /**
     * resize
     */
    public resize() {
        this.directiveRef.update();
    }

    /**
     * selectDate
     */
    public selectDate() {
        this.user.subscribe((user) => {
            const seller = user.seller;
            if (this.scheduleDate === undefined || this.scheduleDate === '') {
                this.scheduleDate = moment().format('YYYY-MM-DD');
            }
            const scheduleDate = this.scheduleDate;
            if (seller === undefined) {
                return;
            }
            this.store.dispatch(new admissionAction.SelectScheduleDate({ scheduleDate }));
            this.store.dispatch(new masterAction.GetSchedule({ seller, scheduleDate }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(masterAction.ActionTypes.GetScheduleSuccess),
            tap(() => {
                this.master.subscribe((master) => {
                    const screeningEvents = master.screeningEvents;
                    this.screeningWorkEvents = screeningEventsToWorkEvents({ screeningEvents });
                    this.update();
                }).unsubscribe();
             })
        );

        const fail = this.actions.pipe(
            ofType(masterAction.ActionTypes.GetScheduleFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    /**
     * selectSchedule
     */
    public selectSchedule(screeningEvent: factory.chevre.event.screeningEvent.IEvent) {
        this.store.dispatch(new admissionAction.SelectScreeningEvent({ screeningEvent }));
        this.store.dispatch(new admissionAction.InitializeQrcodeToken());
        this.router.navigate(['/admission/check']);
    }

}
