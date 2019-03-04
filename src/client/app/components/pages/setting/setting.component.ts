import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as libphonenumber from 'libphonenumber-js';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { connectionType, printers, ViewType } from '../../../models';
import { LibphonenumberFormatPipe } from '../../../pipes/libphonenumber-format.pipe';
import { UtilService } from '../../../services';
import * as masterAction from '../../../store/actions/master.action';
import * as orderAction from '../../../store/actions/order.action';
import * as userAction from '../../../store/actions/user.action';
import * as reducers from '../../../store/reducers';

@Component({
    selector: 'app-setting',
    templateUrl: './setting.component.html',
    styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
    public settingForm: FormGroup;
    public user: Observable<reducers.IUserState>;
    public master: Observable<reducers.IMasterState>;
    public error: Observable<string | null>;
    public posList: { id: string; name: string; typeOf: string; }[];
    public printers: typeof printers = printers;
    public connectionType: typeof connectionType = connectionType;
    public ViewType: typeof ViewType = ViewType;
    constructor(
        private actions: Actions,
        private formBuilder: FormBuilder,
        private store: Store<reducers.IState>,
        private util: UtilService,
        private router: Router,
        private translate: TranslateService
    ) { }

    public ngOnInit() {
        this.user = this.store.pipe(select(reducers.getUser));
        this.master = this.store.pipe(select(reducers.getMaster));
        this.error = this.store.pipe(select(reducers.getError));
        this.posList = [];
        this.getTheaters();
        this.createSettlingForm();
    }

    private createSettlingForm() {
        const NAME_MAX_LENGTH = 12;
        const MAIL_MAX_LENGTH = 50;
        const TEL_MAX_LENGTH = 11;
        const TEL_MIN_LENGTH = 9;

        this.settingForm = this.formBuilder.group({
            theaterCode: ['', [
                Validators.required
            ]],
            posId: ['', [
                Validators.required
            ]],
            familyName: ['', [
                Validators.required,
                Validators.maxLength(NAME_MAX_LENGTH),
                Validators.pattern(/^[ァ-ヶー]+$/)
            ]],
            givenName: ['', [
                Validators.required,
                Validators.maxLength(NAME_MAX_LENGTH),
                Validators.pattern(/^[ァ-ヶー]+$/)
            ]],
            email: ['', [
                Validators.required,
                Validators.maxLength(MAIL_MAX_LENGTH),
                Validators.email
            ]],
            telephone: ['', [
                Validators.required,
                Validators.maxLength(TEL_MAX_LENGTH),
                Validators.minLength(TEL_MIN_LENGTH),
                Validators.pattern(/^[0-9]+$/),
                (control: AbstractControl): ValidationErrors | null => {
                    const field = control.root.get('telephone');
                    if (field !== null) {
                        const parsedNumber = libphonenumber.parse(field.value, 'JP');
                        if (parsedNumber.phone === undefined) {
                            return { telephone: true };
                        }
                        const isValid = libphonenumber.isValidNumber(parsedNumber);
                        if (!isValid) {
                            return { telephone: true };
                        }
                    }

                    return null;
                }
            ]],
            printerType: [''],
            printerIpAddress: [''],
            limitedPurchaseCount: ['', [
                Validators.required,
                Validators.pattern(/^[0-9]+$/)
            ]],
            viewType: ['', [
                Validators.required
            ]]
        });
        this.user.subscribe((user) => {
            if (user.seller !== undefined
                && user.seller.location !== undefined) {
                this.settingForm.controls.theaterCode.setValue(user.seller.location.branchCode);
            }
            if (user.pos !== undefined) {
                this.changePosList();
                this.settingForm.controls.posId.setValue(user.pos.id);
            }
            if (user.customerContact !== undefined) {
                this.settingForm.controls.familyName.setValue(user.customerContact.familyName);
                this.settingForm.controls.givenName.setValue(user.customerContact.givenName);
                this.settingForm.controls.email.setValue(user.customerContact.email);
                this.settingForm.controls.telephone.setValue(new LibphonenumberFormatPipe().transform(user.customerContact.telephone));
            }
            if (user.printer !== undefined) {
                this.settingForm.controls.printerType.setValue(user.printer.connectionType);
                this.settingForm.controls.printerIpAddress.setValue(user.printer.ipAddress);
            }
            this.settingForm.controls.limitedPurchaseCount.setValue(user.limitedPurchaseCount);
            this.settingForm.controls.viewType.setValue(user.viewType);
        }).unsubscribe();
    }

    public changePosList() {
        this.settingForm.controls.posId.setValue('');
        const theaterCode = this.settingForm.controls.theaterCode.value;
        if (theaterCode === '') {
            this.posList = [];
            return;
        }
        this.master.subscribe((master) => {
            const findTheater =
                master.sellers.find(theater =>
                    (theater.location !== undefined && theater.location.branchCode === theaterCode)
                );
            if (findTheater === undefined) {
                this.posList = [];
                return;
            }
            this.posList = (findTheater.hasPOS === undefined) ? [] : findTheater.hasPOS;
        }).unsubscribe();
    }

    /**
     * getTheaters
     */
    public getTheaters() {
        this.store.dispatch(new masterAction.GetSellers({ params: {} }));

        const success = this.actions.pipe(
            ofType(masterAction.ActionTypes.GetSellersSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(masterAction.ActionTypes.GetSellersFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public onSubmit() {
        Object.keys(this.settingForm.controls).forEach((key) => {
            this.settingForm.controls[key].markAsTouched();
        });
        if (this.settingForm.invalid) {
            this.util.openAlert({
                title: this.translate.instant('common.error'),
                body: `
                    <p class="mb-4">${this.translate.instant('setting.alert.validation')}</p>
                        <div class="p-3 bg-light-gray select-text">
                        <code>${JSON.stringify(this.settingForm.errors)}</code>
                    </div>`
            });
            return;
        }
        this.master.subscribe((master) => {
            const findMovieTheater = master.sellers.find(theater =>
                (theater.location !== undefined && theater.location.branchCode === this.settingForm.controls.theaterCode.value)
            );
            if (findMovieTheater === undefined) {
                return;
            }
            const findPos = (<any>findMovieTheater).hasPOS.find((pos: any) => {
                return pos.id === this.settingForm.controls.posId.value;
            });
            if (findPos === undefined) {
                return;
            }
            this.store.dispatch(new userAction.UpdateAll({
                seller: findMovieTheater,
                pos: findPos,
                customerContact: {
                    familyName: this.settingForm.controls.familyName.value,
                    givenName: this.settingForm.controls.givenName.value,
                    email: this.settingForm.controls.email.value,
                    telephone: this.settingForm.controls.telephone.value
                },
                printer: {
                    ipAddress: this.settingForm.controls.printerIpAddress.value,
                    connectionType: this.settingForm.controls.printerType.value
                },
                limitedPurchaseCount: Number(this.settingForm.controls.limitedPurchaseCount.value),
                viewType: this.settingForm.controls.viewType.value
            }));
            this.util.openAlert({
                title: this.translate.instant('common.complete'),
                body: this.translate.instant('setting.alert.success')
            });

        }).unsubscribe();

    }

    public print() {
        const printer = {
            connectionType: this.settingForm.controls.printerType.value,
            ipAddress: this.settingForm.controls.printerIpAddress.value
        };
        this.store.dispatch(new orderAction.Print({ orders: [], printer }));

        const success = this.actions.pipe(
            ofType(orderAction.ActionTypes.PrintSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(orderAction.ActionTypes.PrintFail),
            tap(() => {
                this.error.subscribe((error) => {
                    this.util.openAlert({
                        title: this.translate.instant('common.error'),
                        body: `
                        <p class="mb-4">${this.translate.instant('setting.alert.print')}</p>
                            <div class="p-3 bg-light-gray select-text">
                            <code>${error}</code>
                        </div>`
                    });
                }).unsubscribe();
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

}
