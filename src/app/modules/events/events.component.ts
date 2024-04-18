import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { User, Domain, Event, Registration } from '../../core/app.models';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { EventService } from './event.service';
import { DomainService } from '../domains/domain.service';
import { RegistrationService } from '../registration/registration.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [
        DatePipe,
        DecimalPipe,
        MatCardModule,
        MatIconModule,
        MatListModule,
        MatInputModule,
        MatButtonModule,
        MatDividerModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatDatepickerModule
    ],
    templateUrl: './events.component.html'
})
export default class EventsComponent implements OnInit, OnDestroy {
    events: Event[] = [];
    domains: Domain[] = [];
    registrations: Registration[] = [];

    currentUser!: User | null;

    private _router = inject(Router);
    private _authService = inject(AuthService);
    private _eventService = inject(EventService);
    private _domainService = inject(DomainService);
    private _registrationService = inject(RegistrationService);

    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        combineLatest([
            this._authService.currentUserObs$,
            this._domainService.domainsObs$,
            this._eventService.getEvents(),
            this._registrationService.getRegistrations({})
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ([currentUser, domains, events, registrations]) => {
                    this.currentUser = currentUser;
                    this.domains = domains;
                    this.events = events;
                    this.registrations = registrations;
                }
            });
    }

    getAttendeeCountByEventId(eventId: string): number {
        let count = 0;
        this.registrations.forEach(r => {
            if (r.eventId === eventId) count += 1;
        });
        return count;
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
