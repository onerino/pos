import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-development-index',
    templateUrl: './development-index.component.html',
    styleUrls: ['./development-index.component.scss']
})
export class DevelopmentIndexComponent implements OnInit {
    public environment = environment;

    constructor() { }

    public ngOnInit() {
    }

}
