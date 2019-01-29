import { AuthGuardService } from '../canActivates';
import { SettingGuardService } from '../canActivates/setting-guard.service';
import { BaseComponent } from '../components/pages/base/base.component';
import { OrderListComponent } from '../components/pages/order/order-list/order-list.component';

/**
 * オーダールーティング
 */
export const route = {
    path: 'order',
    component: BaseComponent,
    canActivate: [AuthGuardService, SettingGuardService],
    children: [
        { path: 'list', component: OrderListComponent }
    ]
};
