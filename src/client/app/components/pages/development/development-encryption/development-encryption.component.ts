import { Component, OnInit } from '@angular/core';
import * as qrcode from 'qrcode';
import { UtilService } from '../../../../services';

@Component({
    selector: 'app-development-encryption',
    templateUrl: './development-encryption.component.html',
    styleUrls: ['./development-encryption.component.scss']
})
export class DevelopmentEncryptionComponent implements OnInit {
    public encodeText: string;
    public encodeResult?: { salt: string; iv: string; encrypted: string; };
    public qrcode: string;
    public salt: string;
    public iv: string;
    public encrypted: string;
    public decodeResult?: { decrypted: string; };

    constructor(
        private util: UtilService
    ) { }

    public ngOnInit() {
        this.encodeText = '';
        this.salt = '';
        this.iv = '';
        this.encrypted = '';
    }

    public async encode() {
        if (this.encodeText === '') {
            return;
        }
        this.encodeResult = undefined;
        this.encodeResult = await this.util.encryptionEncode(this.encodeText);
        const canvas = document.createElement('canvas');
        const qrcodeText = `${this.encodeResult.salt},${this.encodeResult.iv},${this.encodeResult.encrypted}`;
        await qrcode.toCanvas(canvas, qrcodeText);
        this.qrcode = canvas.toDataURL();
    }

    public async decode() {
        if (this.salt === '' || this.iv === '' || this.encrypted === '') {
            return;
        }
        this.decodeResult = undefined;
        this.decodeResult = await this.util.encryptionDecode({
            salt: this.salt,
            iv: this.iv,
            encrypted: this.encrypted
        });
    }

}
