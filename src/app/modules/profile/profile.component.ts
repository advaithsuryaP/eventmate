import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Domain, Event, Registration, User } from '../../core/app.models';
import { Subject, combineLatest, switchMap, takeUntil } from 'rxjs';
import { DatePipe, NgIf, TitleCasePipe } from '@angular/common';
import { RegistrationService } from '../registration/registration.service';
import { FetchEventsPayload } from '../../core/app.payload';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventService } from '../events/event.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DomainService } from '../domains/domain.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../core/app.constants';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        NgIf,
        TitleCasePipe,
        DatePipe,
        MatExpansionModule,
        MatIconModule,
        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule
    ],
    templateUrl: './profile.component.html'
})
export default class ProfileComponent implements OnInit, OnDestroy {
    isLoading: boolean = false;

    currentUser: User | null = null;

    events: Event[] = [];
    domains: Domain[] = [];
    registrations: Registration[] = [];

    private _snackbar = inject(MatSnackBar);
    private _authService = inject(AuthService);
    private _eventService = inject(EventService);
    private _domainService = inject(DomainService);
    private _registrationService = inject(RegistrationService);

    private _unsubscribeAll: Subject<null> = new Subject();
    ngOnInit(): void {
        this.isLoading = true;
        this._authService.currentUserObs$
            .pipe(
                switchMap(currentUser => {
                    this.currentUser = currentUser;
                    const payload: FetchEventsPayload = { userId: currentUser?._id };
                    return combineLatest([
                        this._domainService.domainsObs$,
                        this._eventService.eventsObs$,
                        this._registrationService.getRegistrations(payload)
                    ]);
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: ([domains, events, registrations]) => {
                    this.isLoading = false;
                    this.domains = domains;
                    this.events = events;
                    this.registrations = registrations;
                }
            });
    }

    getEventById(eventId: string): Event | undefined {
        return this.events.find(e => e._id === eventId);
    }

    getDomainById(domainId: string): Domain | undefined {
        return this.domains.find(d => d._id === domainId);
    }

    cancelRegistration(registrationId: string, index: number): void {
        this.isLoading = true;
        this._registrationService.deleteRegistration(registrationId).subscribe({
            next: response => {
                if (response.data.deletedCount === 1) {
                    this._snackbar.open(response.message, SNACKBAR_ACTION.SUCCESS);
                    this.registrations.splice(index, 1);
                } else {
                    this._snackbar.open('Error while cancelling the registration', SNACKBAR_ACTION.ERROR);
                }
                this.isLoading = false;
            }
        });
    }

    updateInterest(): void {}

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
