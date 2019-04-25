import { AuthGuardService } from '../canActivates';
import { SettingGuardService } from '../canActivates/setting-guard.service';
import { ReservationSearchComponent } from '../components/pages';
import { BaseComponent } from '../components/pages/base/base.component';

/**
 * 予約ルーティング
 */
export const route = {
    path: 'reservation',
    component: BaseComponent,
    canActivate: [AuthGuardService, SettingGuardService],
    children: [
        { path: 'search', component: ReservationSearchComponent }
    ]
};
