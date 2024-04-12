import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, combineLatest, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrentUser, Domain, Event } from '../core/models/app.models';

import { MatListModule, MatListOption } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RegisterEventPayload } from '../core/models/app.payload';
import { AuthService } from '../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../events/event.service';
import { DomainService } from '../domains/domain.service';
import { RegistrationService } from './registration.service';

@Component({
    selector: 'app-registration',
    standalone: true,
    imports: [NgIf, NgFor, MatListModule, MatCardModule, DatePipe, MatButtonModule, RouterLink],
    templateUrl: './registration.component.html',
    styleUrl: './registration.component.css'
})
export default class RegistrationComponent implements OnInit, OnDestroy {
    isLoading: boolean = false;
    private _route = inject(ActivatedRoute);
    private _authService = inject(AuthService);
    private _eventService = inject(EventService);
    private _snackbarService = inject(MatSnackBar);
    private _domainService = inject(DomainService);
    private _registrationService = inject(RegistrationService);

    event!: Event;
    domains: Domain[] = [];
    currentUser: CurrentUser | null = null;

    private _unsubscribeAll: Subject<null> = new Subject();
    ngOnInit(): void {
        this.isLoading = true;
        this._route.paramMap
            .pipe(
                switchMap(paramMap => {
                    const eventId: string = paramMap.get('eventId') ?? '';
                    return combineLatest([
                        this._authService.currentUserObs$,
                        this._domainService.domainsObs$,
                        this._eventService.getEvent(eventId)
                    ]);
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: ([currentUser, domains, event]) => {
                    this.isLoading = false;
                    this.event = event;
                    this.domains = domains;
                    this.currentUser = currentUser;
                }
            });
    }

    getDomainNameById(id: string): string {
        return this.domains.find(d => d._id === id)?.name ?? 'Unknown Domain';
    }

    getDomainInterestsById(id: string): string[] {
        return this.domains.find(d => d._id === id)?.interests ?? [];
    }

    registerForEvent(selectedOptions: MatListOption[]): void {
        const interests: string[] = [];
        selectedOptions.forEach(option => interests.push(option.value));
        const payload: RegisterEventPayload = {
            userId: this.currentUser!.userId,
            eventId: this.event._id,
            interests: interests,
            domainId: this.event.domainId
        };
        this._registrationService.registerEvent(payload).subscribe({
            next: response => {
                this._snackbarService.open(response, 'SUCCESS', { duration: 3000 });
            }
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
