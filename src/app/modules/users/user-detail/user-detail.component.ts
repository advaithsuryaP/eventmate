import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, switchMap, combineLatest, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { SNACKBAR_ACTION } from '../../../core/app.constants';
import { User, Domain, Registration, Event } from '../../../core/app.models';
import { FetchEventsPayload } from '../../../core/app.payload';
import { DomainService } from '../../domains/domain.service';
import { EventService } from '../../events/event.service';
import { RegistrationService } from '../../registration/registration.service';
import { TitleCasePipe, DatePipe, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
    standalone: true,
    imports: [
        NgIf,
        DatePipe,
        TitleCasePipe,
        MatIconModule,
        MatChipsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatExpansionModule
    ],
    templateUrl: './user-detail.component.html'
})
export default class UserDetailComponent implements OnInit, OnDestroy {
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
        this._authService.currentUser$
            .pipe(
                switchMap(currentUser => {
                    this.currentUser = currentUser;
                    const payload: FetchEventsPayload = { userId: currentUser?._id };
                    return combineLatest([
                        this._domainService.domains$,
                        this._eventService.events$,
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
