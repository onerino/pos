import { AuthGuardService } from '../canActivates';
import { SettingGuardService } from '../canActivates/setting-guard.service';
import { BaseComponent } from '../components/pages/base/base.component';
import { PurchaseBaseComponent } from '../components/pages/purchase/purchase-base/purchase-base.component';
import { PurchaseCartComponent } from '../components/pages/purchase/purchase-cart/purchase-cart.component';
import { PurchaseCompleteComponent } from '../components/pages/purchase/purchase-complete/purchase-complete.component';
import { PurchaseConfirmComponent } from '../components/pages/purchase/purchase-confirm/purchase-confirm.component';
import { PurchasePaymentComponent } from '../components/pages/purchase/purchase-payment/purchase-payment.component';
import { PurchaseScheduleComponent } from '../components/pages/purchase/purchase-schedule/purchase-schedule.component';
import { PurchaseSeatComponent } from '../components/pages/purchase/purchase-seat/purchase-seat.component';
import { PurchaseTicketComponent } from '../components/pages/purchase/purchase-ticket/purchase-ticket.component';


/**
 * 購入ルーティング
 */
export const route = {
    path: 'purchase',
    component: PurchaseBaseComponent,
    canActivate: [AuthGuardService, SettingGuardService],
    children: [
        { path: 'seat', component: PurchaseSeatComponent },
        { path: 'ticket', component: PurchaseTicketComponent },
        { path: 'payment', component: PurchasePaymentComponent },
        { path: 'confirm', component: PurchaseConfirmComponent },
        { path: 'complete', component: PurchaseCompleteComponent },
        { path: 'cart', component: PurchaseCartComponent}
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
        { path: 'schedule', component: PurchaseScheduleComponent }
    ]
};
