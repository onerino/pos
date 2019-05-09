import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {

    @Input() public title: string;
    @Input() public body: string;
    @Input() public cb: Function;

    constructor(
        public modal: BsModalRef,
        private elementRef: ElementRef
    ) { }

    public ngOnInit() {
        const element: HTMLElement = this.elementRef.nativeElement.querySelector('.scroll-vertical');
        setTimeout(() => {
            element.scrollTop = 0;
        }, 0);
    }

    public close() {
        this.modal.hide();
        this.cb();
    }

}
