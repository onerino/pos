import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import jsqr from 'jsqr';
import * as moment from 'moment';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { UtilService } from '../../../../services';
import { admissionAction } from '../../../../store/actions';
import * as reducers from '../../../../store/reducers';

@Component({
    selector: 'app-admission-check',
    templateUrl: './admission-check.component.html',
    styleUrls: ['./admission-check.component.scss']
})
export class AdmissionCheckComponent implements OnInit, OnDestroy {
    public admission: Observable<reducers.IAdmissionState>;
    public isLoading: Observable<boolean>;
    public stream: MediaStream | null;
    public isShowVideo: boolean;
    public video: HTMLVideoElement;
    public scanTimer: any;
    public scanLoop: any;
    public updateLoop: any;
    public moment: typeof moment = moment;
    public inputCode: string;
    public environment = environment;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router,
        private util: UtilService,
        private translate: TranslateService
    ) { }

    public ngOnInit() {
        this.inputCode = '';
        this.stream = null;
        this.video = <HTMLVideoElement>document.getElementById('video');
        this.video.width = window.innerWidth;
        this.isLoading = this.store.pipe(select(reducers.getLoading));
        this.admission = this.store.pipe(select(reducers.getAdmission));
        this.store.dispatch(new admissionAction.InitializeQrcodeToken());
    }

    public ngOnDestroy() {
        clearTimeout(this.scanTimer);
        clearInterval(this.scanLoop);
        clearInterval(this.updateLoop);
    }

    @HostListener('document:keypress', ['$event'])
    public handleKeyboardEvent(event: KeyboardEvent) {
        const KEY_ENTER = 'Enter';
        const KEY_ESCAPE = 'Escape';
        if (event.key === KEY_ENTER && this.inputCode.length > 0) {
            // 読み取り完了
            this.check(this.inputCode);
            this.inputCode = '';
        } else if (event.key !== KEY_ESCAPE) {
            this.inputCode += event.key;
        }
    }

    public async start() {
        try {
            this.inputCode = '';
            const constraints = {
                audio: false,
                video: { facingMode: { exact: 'environment' } }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.stream = stream;
            this.video.srcObject = this.stream;
            const scanLoopTime = 500;
            this.scanLoop = setInterval(() => {
                const code = this.scan();
                if (this.inputCode === code) {
                    return;
                }
                if (code !== null) {
                    this.inputCode = code;
                    // 読み取り完了
                    this.check(code);
                }
            }, scanLoopTime);
            this.isShowVideo = true;
        } catch (error) {
            console.error(error);
            alert(this.translate.instant('admission.check.alert.camera'));
        }
    }

    public stop() {
        if (this.stream === null) {
            return;
        }
        this.stream.getVideoTracks().forEach((track) => {
            track.stop();
        });
        this.stream = null;
        this.isShowVideo = false;
    }

    public scan() {
        if (this.stream === null) {
            return null;
        }
        // キャンバスへ反映
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        const context = <CanvasRenderingContext2D>canvas.getContext('2d');
        const width = this.video.offsetWidth;
        const height = this.video.offsetHeight;
        canvas.setAttribute('width', String(width));
        canvas.setAttribute('height', String(height));
        context.drawImage(this.video, 0, 0, width, height);
        // QRコードデコード
        const imageData = context.getImageData(0, 0, width, height);
        const qrcode = jsqr(imageData.data, width, height);
        if (qrcode === null) {
            return null;
        }
        return qrcode.data;
    }

    /**
     * QRコードから入場を確認
     * @param {string} code
     */
    public check(code: string) {
        if (this.scanTimer !== undefined) {
            clearTimeout(this.scanTimer);
        }
        this.admission.subscribe((admission) => {
            const screeningEvent = admission.screeningEvent;
            if (screeningEvent === undefined) {
                return;
            }
            this.store.dispatch(new admissionAction.Check({ code, screeningEvent }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(admissionAction.ActionTypes.CheckSuccess),
            tap(() => {
                const time = 30000;
                this.scanTimer = setTimeout(() => {
                    this.store.dispatch(new admissionAction.InitializeQrcodeToken());
                }, time);
            })
        );

        const fail = this.actions.pipe(
            ofType(admissionAction.ActionTypes.CheckFail),
            tap(() => {
                this.util.openAlert({
                    title: this.translate.instant('common.error'),
                    body: this.translate.instant('admission.check.alert.check')
                });
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public update() {
        const loopTime = 60000; // 1分に一回
        clearInterval(this.updateLoop);
        this.updateLoop = setInterval(() => {
            // this.getScreeningEventReservations();
            // this.sendAll();
            this.getScreeningEvent();
        }, loopTime);
    }

    public getScreeningEvent() {
        this.admission.subscribe((admission) => {
            const screeningEvent = admission.screeningEvent;
            if (screeningEvent === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const id = screeningEvent.id;
            this.store.dispatch(new admissionAction.GetScreeningEvent({ params: { id } }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(admissionAction.ActionTypes.GetScreeningEventSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(admissionAction.ActionTypes.GetScreeningEventFail),
            tap(() => { })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

}
