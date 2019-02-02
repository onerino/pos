import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import {
    AdmissionEffects,
    MasterEffects,
    OrderEffects,
    PurchaseEffects,
    UserEffects
} from './effects';
import { reducer } from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature('App', reducer),
        EffectsModule.forFeature([
            AdmissionEffects,
            PurchaseEffects,
            UserEffects,
            MasterEffects,
            OrderEffects
        ])
    ]
})
export class AppStoreModule { }
