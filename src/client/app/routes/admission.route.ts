import { AuthGuardService } from '../canActivates';
import { SettingGuardService } from '../canActivates/setting-guard.service';
import { AdmissionCheckComponent } from '../components/pages/admission/admission-check/admission-check.component';
import { AdmissionScheduleComponent } from '../components/pages/admission/admission-schedule/admission-schedule.component';
import { BaseComponent } from '../components/pages/base/base.component';

/**
 * 購入ルーティング
 */
export const route = {
    path: 'admission',
    component: BaseComponent,
    canActivate: [AuthGuardService, SettingGuardService],
    children: [
        { path: 'schedule', component: AdmissionScheduleComponent },
        { path: 'check', component: AdmissionCheckComponent }
    ]
};
