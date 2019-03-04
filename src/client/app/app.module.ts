/**
 * NgModule
 */
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';

import {
    AdmissionCheckComponent,
    AdmissionScheduleComponent,
    AuthIndexComponent,
    AuthSigninComponent,
    AuthSignoutComponent,
    BaseComponent,
    CongestionComponent,
    ErrorComponent,
    ExpiredComponent,
    InquiryConfirmComponent,
    InquiryInputComponent,
    MaintenanceComponent,
    NotfoundComponent,
    OrderListComponent,
    PurchaseBaseComponent,
    PurchaseCinemaCartComponent,
    PurchaseCinemaScheduleComponent,
    PurchaseCinemaSeatComponent,
    PurchaseCinemaTicketComponent,
    PurchaseCompleteComponent,
    PurchaseConfirmComponent,
    PurchaseEventScheduleComponent,
    PurchaseEventTicketComponent,
    PurchaseInputComponent,
    PurchasePaymentComponent,
    PurchaseRootComponent,
    SettingComponent,
} from './components/pages';
import {
    AdmissionScheduleWorkComponent,
    AlertModalComponent,
    ConfirmModalComponent,
    ContentsComponent,
    FooterComponent,
    HeaderComponent,
    HeaderMenuComponent,
    LoadingComponent,
    MvtkCheckModalComponent,
    NumericKeypadComponent,
    OrderDetailModalComponent,
    PurchaseCinemaScheduleWorkComponent,
    PurchaseCinemaTicketModalComponent,
    PurchaseEventScheduleWorkComponent,
    PurchaseEventTicketModalComponent,
    PurchaseInfoComponent,
    PurchaseTransactionModalComponent,
    QrCodeModalComponent,
    ScreenComponent,
    TransactionRemainingTimeComponent
} from './components/parts';
import { ChangeLanguagePipe } from './pipes/change-language.pipe';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { LibphonenumberFormatPipe } from './pipes/libphonenumber-format.pipe';
import { StoreModule } from './store.module';
import { CoreStoreModule } from './store/core/store';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, '/i18n/');
}

@NgModule({
    declarations: [
        AppComponent,
        AuthSigninComponent,
        AuthSignoutComponent,
        PurchaseCinemaScheduleComponent,
        PurchaseBaseComponent,
        PurchaseCinemaSeatComponent,
        PurchaseCinemaTicketComponent,
        PurchaseInputComponent,
        PurchaseConfirmComponent,
        PurchaseCompleteComponent,
        NotfoundComponent,
        AuthIndexComponent,
        ContentsComponent,
        HeaderComponent,
        FooterComponent,
        PurchaseCinemaScheduleWorkComponent,
        ScreenComponent,
        PurchaseCinemaTicketModalComponent,
        AlertModalComponent,
        PurchaseInfoComponent,
        LoadingComponent,
        ErrorComponent,
        BaseComponent,
        HeaderMenuComponent,
        ConfirmModalComponent,
        QrCodeModalComponent,
        MvtkCheckModalComponent,
        SettingComponent,
        InquiryInputComponent,
        InquiryConfirmComponent,
        PurchasePaymentComponent,
        LibphonenumberFormatPipe,
        NumericKeypadComponent,
        CongestionComponent,
        MaintenanceComponent,
        PurchaseCinemaCartComponent,
        PurchaseTransactionModalComponent,
        AdmissionScheduleComponent,
        AdmissionCheckComponent,
        AdmissionScheduleWorkComponent,
        OrderListComponent,
        OrderDetailModalComponent,
        TransactionRemainingTimeComponent,
        ExpiredComponent,
        ChangeLanguagePipe,
        FormatDatePipe,
        PurchaseRootComponent,
        PurchaseEventScheduleComponent,
        PurchaseEventTicketComponent,
        PurchaseEventScheduleWorkComponent,
        PurchaseEventTicketModalComponent
    ],
    entryComponents: [
        PurchaseCinemaTicketModalComponent,
        AlertModalComponent,
        ConfirmModalComponent,
        QrCodeModalComponent,
        MvtkCheckModalComponent,
        PurchaseTransactionModalComponent,
        OrderDetailModalComponent,
        PurchaseEventScheduleWorkComponent,
        PurchaseEventTicketModalComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        SwiperModule,
        StoreModule,
        CoreStoreModule,
        NgbModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
