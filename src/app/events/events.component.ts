import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Domain, Event } from '../core/models/app.models';
import { Subject, switchMap } from 'rxjs';
import { EventsService } from '../core/services/events.service';
import { DomainsService } from '../core/services/domains.service';

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [
        CommonModule,
        MatListModule,
        MatCardModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatIconModule
    ],
    templateUrl: './events.component.html',
    styleUrl: './events.component.css'
})
export default class EventsComponent implements OnInit, OnDestroy {
    events: Event[] = [];
    domains: Domain[] = [];
    private _unsubscribeAll: Subject<null> = new Subject();

    private _eventsService = inject(EventsService);
    private _domainsService = inject(DomainsService);

    ngOnInit(): void {
        this._domainsService
            .getDomains()
            .pipe(
                switchMap(response => {
                    this.domains = response;
                    return this._eventsService.getEvents();
                })
            )
            .subscribe({
                next: response => {
                    this.events = response;
                }
            });
    }

    getDomainNameById(id: string) {
        return this.domains.find(d => d._id === id)?.name ?? 'Unknown Domain';
    }

    createEvent() {
        /**
         * Technology: 661807543a08d7d257328e14
         * Business: 661807dd3a08d7d257328e19
         * Art: 6618084a3a08d7d257328e1e
         */
    }

    userHasRegistered(v: any) {
        return true;
    }

    registerEvent() {}

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
