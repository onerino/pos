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

import { environment } from '../environments/environment';
import {
    AdmissionCheckComponent,
    AdmissionScheduleComponent,
    AuthIndexComponent,
    AuthSigninComponent,
    AuthSignoutComponent,
    BaseComponent,
    CongestionComponent,
    DevelopmentEncryptionComponent,
    DevelopmentIndexComponent,
    DevelopmentScreenComponent,
    ErrorComponent,
    ExpiredComponent,
    InquiryConfirmComponent,
    InquiryInputComponent,
    MaintenanceComponent,
    NotfoundComponent,
    OrderSearchComponent,
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
    ReservationSearchComponent,
    SettingComponent
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
    PurchaseCinemaPerformanceComponent,
    PurchaseCinemaTicketModalComponent,
    PurchaseEventPerformanceComponent,
    PurchaseEventPerformanceConfirmComponent,
    PurchaseEventTicketModalComponent,
    PurchaseInfoComponent,
    PurchaseTermsComponent,
    PurchaseTransactionModalComponent,
    QrCodeModalComponent,
    ReservationDetailModalComponent,
    ScreenComponent,
    TransactionRemainingTimeComponent
} from './components/parts';
import { ChangeLanguagePipe } from './pipes/change-language.pipe';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { LibphonenumberFormatPipe } from './pipes/libphonenumber-format.pipe';
import { StoreModule } from './store.module';
import { CoreStoreModule } from './store/core/store';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, `/${environment.PROJECT_ID}/i18n/`);
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
        OrderSearchComponent,
        OrderDetailModalComponent,
        TransactionRemainingTimeComponent,
        ExpiredComponent,
        ChangeLanguagePipe,
        FormatDatePipe,
        PurchaseRootComponent,
        PurchaseEventScheduleComponent,
        PurchaseEventTicketComponent,
        PurchaseEventTicketModalComponent,
        DevelopmentScreenComponent,
        DevelopmentIndexComponent,
        DevelopmentEncryptionComponent,
        PurchaseCinemaPerformanceComponent,
        PurchaseEventPerformanceComponent,
        PurchaseEventPerformanceConfirmComponent,
        ReservationSearchComponent,
        ReservationDetailModalComponent,
        PurchaseTermsComponent
    ],
    entryComponents: [
        PurchaseCinemaTicketModalComponent,
        AlertModalComponent,
        ConfirmModalComponent,
        QrCodeModalComponent,
        MvtkCheckModalComponent,
        PurchaseTransactionModalComponent,
        OrderDetailModalComponent,
        PurchaseEventTicketModalComponent,
        ReservationDetailModalComponent
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
