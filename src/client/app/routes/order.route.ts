import { AuthGuardService } from '../canActivates';
import { SettingGuardService } from '../canActivates/setting-guard.service';
import { BaseComponent } from '../components/pages/base/base.component';
import { OrderSearchComponent } from '../components/pages/order/order-search/order-search.component';

/**
 * オーダールーティング
 */
export const route = {
    path: 'order',
    component: BaseComponent,
    canActivate: [AuthGuardService, SettingGuardService],
    children: [
        { path: 'search', component: OrderSearchComponent }
    ]
};
