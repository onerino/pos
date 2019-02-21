import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import * as qrcode from 'qrcode';
import { getTicketPrice } from './purchase.function';

/**
 * キャンバスへ描画
 */
export async function drawCanvas(args: {
    data: {
        confirmationNumber: number;
        theaterName: string;
        screenName: string;
        eventName: string;
        startDate: string;
        seatNumber: string;
        ticketName: string;
        price: number;
        qrcode: string;
    }
}) {
    const canvas = document.createElement('canvas');
    const data = args.data;
    const size = { width: 560, height: 780 };
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (context === null) {
        throw new Error('context is null');
    }
    const drawImage = (drawImageArgs: {
        image: HTMLImageElement;
        x: number;
        y: number;
        width: number;
        height: number;
    }) => {
        return new Promise((resolve) => {
            drawImageArgs.image.onload = () => {
                context.drawImage(
                    drawImageArgs.image,
                    drawImageArgs.x,
                    drawImageArgs.y,
                    drawImageArgs.width,
                    drawImageArgs.height
                );
                resolve();
            };
        });
    };
    const left = 0;
    const right = canvas.width;
    const bottom = size.height;
    const center = canvas.width / 2;
    const font = `"Hiragino Sans", "Hiragino Kaku Gothic ProN", "游ゴシック  Medium", meiryo, sans-serif`;
    // ロゴ
    const logoImage = new Image();
    logoImage.src = '/assets/images/logo.svg';
    await drawImage({ image: logoImage, x: center - 100, y: 0, width: 200, height: 32 });

    // 劇場
    context.fillStyle = 'black';
    context.font = `bold 34px ${font}`;
    context.textAlign = 'center';
    context.fillText(data.theaterName, center, 85);
    // 鑑賞日時
    context.font = `normal 40px ${font}`;
    context.textAlign = 'center';
    context.fillText(`${data.startDate}～`, center, 160);
    context.strokeStyle = '#000';
    // 作品名
    context.font = `bold 40px ${font}`;
    const title = data.eventName;
    const titleLimit = 18;
    if (title.length > titleLimit) {
        context.fillText(title.slice(0, titleLimit), center, 230);
        context.fillText(title.slice(titleLimit, title.length), center, 280);
    } else {
        context.fillText(title, center, 230);
    }
    // 背景
    const boxImage = new Image();
    boxImage.src = '/assets/images/print_box.svg';
    await drawImage({ image: boxImage, x: 0, y: 320, width: canvas.width, height: 210 });
    // スクリーン
    context.beginPath();
    context.font = `bold 40px ${font}`;
    context.fillText(data.screenName, center, 400);
    // 座席
    context.beginPath();
    context.fillText(data.seatNumber, center, 490);
    // 券種
    context.textAlign = 'left';
    context.font = `normal 40px ${font}`;
    context.fillText(data.ticketName.slice(0, 8), 0, 590);
    // 金額
    context.textAlign = 'right';
    context.fillText('￥' + data.price.toLocaleString(), right, 590);
    // QR
    const qrcodeCanvas = document.createElement('canvas');
    await qrcode.toCanvas(qrcodeCanvas, data.qrcode);
    context.drawImage(qrcodeCanvas, (canvas.width - 170), (bottom - 170), 170, 170);
    // 説明
    context.textAlign = 'left';
    context.font = `normal 22px ${font}`;
    context.fillText('■ 上記日時1回限り有効', left, bottom - 140);
    context.fillText('■ 変更、払戻不可', left, bottom - 110);
    // 購入番号
    context.font = `normal 22px ${font}`;
    context.fillText(`購入番号 ${data.confirmationNumber}`, left, bottom - 60);
    // 端末
    context.fillText(`端末 TEST`, left, bottom - 30);
    // 発券時間
    const date = moment().format('YYYY/MM/DD HH:mm');
    context.fillText(`(${date} 発券)`, left, bottom);

    return canvas;
}

/**
 * 印刷イメージ作成
 */
export async function createPrintImage(args: {
    order: factory.order.IOrder;
    offerIndex: number;
}) {
    const order = args.order;
    const acceptedOffer = order.acceptedOffers[args.offerIndex];
    if (acceptedOffer.itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
        throw new Error('reservationType is not EventReservation');
    }
    if (acceptedOffer.itemOffered.reservedTicket.ticketedSeat === undefined) {
        throw new Error('ticketedSeat is undefined');
    }
    const data = {
        confirmationNumber: args.order.confirmationNumber,
        theaterName: acceptedOffer.itemOffered.reservationFor.superEvent.location.name.ja,
        screenName: acceptedOffer.itemOffered.reservationFor.location.name.ja,
        eventName: acceptedOffer.itemOffered.reservationFor.name.ja,
        startDate: moment(acceptedOffer.itemOffered.reservationFor.startDate).format('YY/MM/DD (ddd) HH:mm'),
        seatNumber: acceptedOffer.itemOffered.reservedTicket.ticketedSeat.seatNumber,
        ticketName: acceptedOffer.itemOffered.reservedTicket.ticketType.name.ja,
        price: getTicketPrice(acceptedOffer).single,
        qrcode: <string>acceptedOffer.itemOffered.reservedTicket.ticketToken
    };
    const canvas = await drawCanvas({ data });

    return canvas;
}

/**
 * テスト印刷用イメージ作成
 */
export async function createTestPrintImage() {
    const canvas = await drawCanvas({
        data: {
            confirmationNumber: 12345678,
            theaterName: 'テスト劇場',
            screenName: 'テストスクリーン',
            eventName: 'テスト-----------------------------作品',
            startDate: moment().format('YY/MM/DD (ddd) HH:mm'),
            seatNumber: 'TEST-1',
            ticketName: 'テスト1234567890券種',
            price: 1000,
            qrcode: 'TEST'
        }
    });

    return canvas;
}
