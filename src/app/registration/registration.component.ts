import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, combineLatest, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User, Domain, Event } from '../core/app.models';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RegisterEventPayload } from '../core/app.payload';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../events/event.service';
import { DomainService } from '../domains/domain.service';
import { RegistrationService } from './registration.service';
import { SNACKBAR_ACTION } from '../core/app.constants';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-registration',
    standalone: true,
    imports: [MatCardModule, DatePipe, MatButtonModule, RouterLink, MatChipsModule],
    templateUrl: './registration.component.html',
    styleUrl: './registration.component.css'
})
export default class RegistrationComponent implements OnInit, OnDestroy {
    isLoading: boolean = false;
    selectedInterest: string = '';
    private _route = inject(ActivatedRoute);
    private _authService = inject(AuthService);
    private _eventService = inject(EventService);
    private _snackbarService = inject(MatSnackBar);
    private _domainService = inject(DomainService);
    private _registrationService = inject(RegistrationService);

    event!: Event;
    domains: Domain[] = [];
    currentUser: User | null = null;

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

    onSelectInterest(event: MatChipSelectionChange) {
        if (event.selected) {
            this.selectedInterest = event.source.value;
        } else this.selectedInterest = '';
    }

    registerForEvent(): void {
        if (this.selectedInterest) {
            const payload: RegisterEventPayload = {
                userId: this.currentUser!._id,
                eventId: this.event._id,
                interests: [this.selectedInterest],
                domainId: this.event.domainId
            };
            this._registrationService.registerEvent(payload).subscribe({
                next: response => {
                    this._snackbarService.open(response, SNACKBAR_ACTION.SUCCESS, { duration: 3000 });
                }
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
