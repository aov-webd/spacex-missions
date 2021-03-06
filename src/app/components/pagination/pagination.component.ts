import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoreService } from '../../services/store.service';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

    pageSubscription = Subscription;
    page: number = 1;

    constructor(
        private storeService: StoreService
    ) {
        storeService.queryParams.subscribe({
            next: (data) => {
                this.page = data.offset + 1;
            }
        });
    }

    ngOnInit(): void {
        this.page = Math.floor(this.storeService.getOffset() / 5) + 1;
    }

    incCurOffset() {
        this.storeService.incOffset();
        this.page = Math.floor(this.storeService.getOffset() / 5) + 1;
    }

    decCurOffset() {
        this.storeService.decOffset();
        this.page = Math.floor(this.storeService.getOffset() / 5) + 1;
    }
}
