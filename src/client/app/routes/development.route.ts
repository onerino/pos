import { BaseComponent, DevelopmentScreenComponent } from '../components/pages';

/**
 * 開発ルーティング
 */
export const route = {
    path: 'development',
    component: BaseComponent,
    children: [
        { path: 'screen',  component: DevelopmentScreenComponent }
    ]
};
