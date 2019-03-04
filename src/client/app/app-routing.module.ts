/**
 * ルーティング
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    BaseComponent,
    CongestionComponent,
    ErrorComponent,
    ExpiredComponent,
    MaintenanceComponent,
    NotfoundComponent,
    SettingComponent
} from './components/pages';
import * as admission from './routes/admission.route';
import * as auth from './routes/auth.route';
import * as inquiry from './routes/inquiry.route';
import * as order from './routes/order.route';
import * as purchase from './routes/purchase.route';

const appRoutes: Routes = [
    { path: '', redirectTo: '/auth', pathMatch: 'full' },
    purchase.route,
    purchase.schedule,
    auth.route,
    inquiry.route,
    admission.route,
    order.route,
    {
        path: '',
        component: BaseComponent,
        children: [
            { path: 'setting', component: SettingComponent },
            { path: 'error', component: ErrorComponent },
            { path: 'expired', component: ExpiredComponent },
            { path: 'maintenance', component: MaintenanceComponent },
            { path: 'congestion', component: CongestionComponent },
            { path: '**', component: NotfoundComponent }
        ]
    }
];

// tslint:disable-next-line:no-stateless-class
@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { useHash: true, enableTracing: true }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
