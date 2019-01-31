/**
 * 接続の種類
 */
export enum connectionType {
    /**
     * LAN接続
     */
    'LAN',
    /**
     * Bluetooth接続
     */
    'Bluetooth'
}

/**
 * プリンター一覧
 */
export const printers = [
    {
        id: '001',
        connectionType: connectionType.LAN,
        name: { ja: 'スター精密 LAN接続', en: 'Star precision LAN connection' }
    },
    {
        id: '002',
        connectionType: connectionType.Bluetooth,
        name: { ja: 'スター精密 Bluetooth接続', en: 'Star precision Bluetooth connection' }
    }
];

export interface IPrinter {
    id: string;
    ipAddress: string;
}
