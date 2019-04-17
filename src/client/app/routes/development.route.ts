import {
    BaseComponent,
    DevelopmentEncryptionComponent,
    DevelopmentIndexComponent,
    DevelopmentScreenComponent
} from '../components/pages';

/**
 * 開発ルーティング
 */
export const route = {
    path: 'development',
    component: BaseComponent,
    children: [
        { path: '', component: DevelopmentIndexComponent },
        { path: 'screen', component: DevelopmentScreenComponent },
        { path: 'encryption', component: DevelopmentEncryptionComponent }
    ]
};
