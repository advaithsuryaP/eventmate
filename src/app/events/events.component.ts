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
import { CurrentUser, Domain, Event } from '../core/models/app.models';
import { Subject, combineLatest, switchMap, takeUntil } from 'rxjs';
import { EventsService } from '../core/services/events.service';
import { DomainsService } from '../core/services/domains.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

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

    currentUser!: CurrentUser | null;

    private _router = inject(Router);
    private _authService = inject(AuthService);
    private _eventsService = inject(EventsService);
    private _domainsService = inject(DomainsService);

    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        combineLatest([
            this._authService.currentUserObs$,
            this._domainsService.domainsObs$,
            this._eventsService.getEvents()
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ([currentUser, domains, events]) => {
                    this.currentUser = currentUser;
                    this.domains = domains;
                    this.events = events;
                }
            });
    }

    getDomainNameById(id: string): string {
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

    registerEvent(eventId: string) {
        this._router.navigate([`/register/${eventId}`]);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
