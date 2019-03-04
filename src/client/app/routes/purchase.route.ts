import { AuthGuardService } from '../canActivates';
import { SettingGuardService } from '../canActivates/setting-guard.service';
import {
    BaseComponent,
    PurchaseBaseComponent,
    PurchaseCinemaCartComponent,
    PurchaseCinemaScheduleComponent,
    PurchaseCinemaSeatComponent,
    PurchaseCinemaTicketComponent,
    PurchaseCompleteComponent,
    PurchaseConfirmComponent,
    PurchaseEventScheduleComponent,
    PurchaseEventTicketComponent,
    PurchasePaymentComponent,
    PurchaseRootComponent
} from '../components/pages';

/**
 * 購入ルーティング
 */
export const route = {
    path: 'purchase',
    component: PurchaseBaseComponent,
    canActivate: [AuthGuardService, SettingGuardService],
    children: [
        { path: 'root', component: PurchaseRootComponent },
        {
            path: 'cinema',
            children: [
                { path: 'seat', component: PurchaseCinemaSeatComponent },
                { path: 'ticket', component: PurchaseCinemaTicketComponent },
                { path: 'cart', component: PurchaseCinemaCartComponent }
            ]
        },
        {
            path: 'event',
            children: [
                { path: 'ticket', component: PurchaseEventTicketComponent }
            ]
        },
        { path: 'payment', component: PurchasePaymentComponent },
        { path: 'confirm', component: PurchaseConfirmComponent },
        { path: 'complete', component: PurchaseCompleteComponent }
    ]
};

/**
 * 購入スケジュールルーティング
 */
export const schedule = {
    path: 'purchase',
    component: BaseComponent,
    canActivate: [AuthGuardService, SettingGuardService],
    children: [
        {
            path: 'cinema',
            children: [
                { path: 'schedule', component: PurchaseCinemaScheduleComponent }
            ]
        },
        {
            path: 'event',
            children: [
                { path: 'schedule', component: PurchaseEventScheduleComponent }
            ]
        }
    ]
};
