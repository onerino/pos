import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { createPrintImage, createTestPrintImage, sleep } from '../functions';
import { connectionType, IPrinter, printers } from '../models';

@Injectable({
    providedIn: 'root'
})
export class StarPrintService {
    /**
     * 使用端末ID
     */
    public pos?: factory.seller.IPOS;
    /**
     * 印刷内容生成インスタンス
     */
    public builder: any;
    /**
     * 制御用インスタンス
     */
    public trader: any;
    /**
     * プリンター使用状況
     */
    public isReady: boolean;

    constructor() { }

    /**
     * 印刷処理
     */
    public async printProcess(args: {
        orders: factory.order.IOrder[];
        printer: IPrinter;
        pos?: factory.seller.IPOS;
        timeout?: number;
    }) {
        const orders = args.orders;
        const printer = args.printer;
        const pos = args.pos;
        const timeout = (args.timeout === undefined) ? 60000 : args.timeout;
        this.initialize({ printer, pos, timeout });
        let printerRequests: string[] = [];
        if (orders.length === 0) {
            printerRequests = await this.createTestPrinterRequest();
        } else {
            printerRequests = await this.createPrinterRequestList(orders);
        }
        // n分割配列へ変換
        const divide = 4;
        const divideRequests: string[] = [];
        let divideRequest = '';
        printerRequests.forEach((request, index) => {
            divideRequest += request;
            if ((index + 1) % divide === 0) {
                divideRequests.push(divideRequest);
                divideRequest = '';
            }
        });
        if (divideRequest !== '') {
            divideRequests.push(divideRequest);
        }
        for (const printerRequest of divideRequests) {
            // safari対応のため0.3秒待つ
            await sleep(300);
            await this.print({ printerRequest });
        }
    }

    /**
     * 初期化
     */
    private initialize(args: {
        printer: IPrinter;
        pos?: factory.seller.IPOS;
        timeout?: number;
    }) {
        this.pos = args.pos;
        this.builder = new (<any>window).StarWebPrintBuilder();
        this.isReady = false;

        const printer = args.printer;

        try {
            if (printer.ipAddress === '') {
                throw new Error('プリンターのIPアドレスが正しく指定されていません');
            }
            const port = /https/.test(window.location.protocol) ? 443 : 80;
            const findResult = printers.find(p => p.connectionType === printer.connectionType);
            if (findResult === undefined
                || (findResult.connectionType !== connectionType.StarBluetooth
                    && findResult.connectionType !== connectionType.StarLAN)
            ) {
                throw new Error('選択しているプリンターに対応していません');
            }
            const url = (findResult.connectionType === connectionType.StarLAN)
                ? `https://${printer.ipAddress}:${port}/StarWebPRNT/SendMessage`
                : `https://${printer.ipAddress}/StarWebPRNT/SendMessage`;
            const papertype = 'normal';
            const blackmark_sensor = 'front_side';
            // trader設定
            this.trader = new (<any>window).StarWebPrintTrader({ url, papertype, blackmark_sensor });
            // プリンター通信タイムアウト
            this.trader.timeout = (args.timeout === undefined) ? 10000 : args.timeout;

            this.isReady = true;
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 受信データから状態取得
     */
    private getStatusByReceivedResponse(response: any) {
        let isSuccess = true;
        let message = '';
        try {
            if (this.trader.isOffLine({ traderStatus: response.traderStatus })) {
                message += 'プリンターがオフラインです\n';
                isSuccess = false;
            }
            if (this.trader.isNonRecoverableError({ traderStatus: response.traderStatus })) {
                message += 'プリンターに復帰不可能エラーが発生しています\n';
                isSuccess = false;
            }
            if (response.traderCode === '1100') {
                message += 'プリンターまたはご利用端末が通信不能な状態です\n';
                isSuccess = false;
            }
            if (response.traderCode === '2001') {
                message += 'プリンターがビジー状態です\n';
                isSuccess = false;
            }
            if (this.trader.isHighTemperatureStop({ traderStatus: response.traderStatus })) {
                message += '印字ヘッドが高温のため停止しています\n';
                isSuccess = false;
            }
            if (this.trader.isAutoCutterError({ traderStatus: response.traderStatus })) {
                message += '用紙カッターに異常が起きています\n';
                isSuccess = false;
            }
            if (this.trader.isBlackMarkError({ traderStatus: response.traderStatus })) {
                message += 'ブラックマークエラー\n';
                isSuccess = false;
            }
            if (this.trader.isCoverOpen({ traderStatus: response.traderStatus })) {
                message += 'プリンターカバーが開いています\n';
                isSuccess = false;
            }
            if (this.trader.isPaperEnd({ traderStatus: response.traderStatus })) {
                message += '用紙切れです\n';
                isSuccess = false;
            }
            if (!response.traderSuccess || response.traderCode !== '0') {
                isSuccess = false;
            }
        } catch (error) {
            message = error.message;
        }
        return { isSuccess, message, response };
    }

    /**
     * プリンターリクエスト作成
     */
    private async createPrinterRequest(args: {
        order: factory.order.IOrder;
        offerIndex: number;
    }) {
        let request = '';
        const canvas = await createPrintImage({
            order: args.order,
            offerIndex: args.offerIndex
        });
        request = this.builder.createBitImageElement({
            context: canvas.getContext('2d'),
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
        });
        // 紙を切断
        request += this.builder.createCutPaperElement({ feed: true, type: 'partial' });

        return request;
    }

    /**
     * プリンターテスト用リクエスト作成
     */
    private async createTestPrinterRequest() {
        let request = '';
        const canvas = await createTestPrintImage();

        request = this.builder.createBitImageElement({
            context: canvas.getContext('2d'),
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
        });
        // 紙を切断
        request += this.builder.createCutPaperElement({ feed: true, type: 'partial' });

        return [request];
    }

    /**
     * プリンターリクエストリスト作成
     */
    private async createPrinterRequestList(orders: factory.order.IOrder[]) {
        const printerRequests = [];
        for (const order of orders) {
            for (let i = 0; i < order.acceptedOffers.length; i++) {
                const printerRequest = await this.createPrinterRequest({ order, offerIndex: i });
                printerRequests.push(printerRequest);
            }
        }

        return printerRequests;
    }

    /**
     * 印刷
     */
    private async print(args: {
        printerRequest: string;
    }) {
        return new Promise<void>((resolve, reject) => {
            if (!this.isReady) {
                reject({
                    isSuccess: false,
                    message: 'プリンターが初期化されていません',
                    response: undefined
                });

                return;
            }

            // 印刷命令送信後処理
            this.trader.onReceive = (response: any) => {
                const result = this.getStatusByReceivedResponse(response);
                if (!result.isSuccess) {
                    reject(result);

                    return;
                }
                resolve();
            };

            // 印刷命令失敗処理
            this.trader.onError = (response: any) => {
                reject({
                    isSuccess: false,
                    message: 'プリンターとの通信に失敗しました',
                    response
                });
            };

            // プリンターに送信
            this.trader.sendMessage({ request: args.printerRequest });
        });
    }


}
