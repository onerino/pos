/**
 * 環境変数dev
 */
export const environment = {
    production: false,
    APP_PREFIX: 'OY',
    PROJECT_ID: 'oyatsu',
    ENV: 'local',
    ENTRANCE_SERVER_URL: '',
    WAITER_SERVER_URL: '',
    ANALYTICS_ID: '',
    VIEW_TYPE: 'event',
    STORAGE_NAME: 'OYATSU-POS-STATE',
    STORAGE_TYPE: 'localStorage',
    BASE_URL: '/purchase/root',
    LANGUAGE: ['ja'],
    DISPLAY_TICKETED_SEAT: false,
    HEADER_MENU: true,
    HEADER_MENU_SCOPE: ['purchase', 'order', 'reservation', 'setting', 'auth'],
    PURCHASE_CART_MAX_LENGTH: '99',
    PURCHASE_TRANSACTION_TIME: '30',
    PURCHASE_PRE_SCHEDULE_DATE: '3',
    PURCHASE_SCHEDULE_DEFAULT_SELECTED_DATE: '0',
    PURCHASE_SCHEDULE_STATUS_THRESHOLD_VALUE: '30',
    PURCHASE_SCHEDULE_STATUS_THRESHOLD_UNIT: '%',
    PURCHASE_COMPLETE_MAIL_CUSTOM: true,
    INQUIRY_CANCEL: true,
    INQUIRY_QRCODE: false,
    INQUIRY_PRINT: true,
    ORDER_CANCEL: true,
    ORDER_QRCODE: false,
    ORDER_PRINT: true,
    PRINT_QR_CODE_TYPE: 'encryption'
};
