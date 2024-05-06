import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, combineLatest, startWith, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { DomainService } from '../../domains/domain.service';
import { EventService } from '../event.service';
import { Domain, Event, Feedback, Registration, User } from '../../../core/app.models';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../../core/app.constants';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog.component';
import { UserService } from '../../users/user.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
    selector: 'app-event-list',
    standalone: true,
    imports: [
        DatePipe,
        RouterLink,
        DecimalPipe,
        MatCardModule,
        MatIconModule,
        UpperCasePipe,
        MatListModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDividerModule,
        MatTooltipModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatNativeDateModule,
        MatDatepickerModule
    ],
    templateUrl: './event-list.component.html',
    styleUrl: './event-list.component.css'
})
export default class EventListComponent implements OnInit, OnDestroy {
    events: Event[] = [];
    domains: Domain[] = [];
    feedbacks: Feedback[] = [];
    currentUser!: User | null;
    registrations: Registration[] = [];

    domainFilterControl = new FormControl<string | null>(null);

    private _router = inject(Router);
    private _matDialog = inject(MatDialog);
    private _snackbar = inject(MatSnackBar);
    private _userService = inject(UserService);
    private _authService = inject(AuthService);
    private _eventService = inject(EventService);
    private _domainService = inject(DomainService);
    private _loaderService = inject(LoaderService);

    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        const events$ = this._eventService.events$;
        const domainFilter$ = this.domainFilterControl.valueChanges.pipe(startWith(null));

        combineLatest([events$, domainFilter$])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ([events, selectedDomainId]) => {
                    if (selectedDomainId) {
                        this.events = events.filter(e => e.domainId === selectedDomainId);
                    } else this.events = events;
                }
            });

        combineLatest([this._authService.currentUser$, this._domainService.domains$, this._eventService.registrations$])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ([currentUser, domains, registrations]) => {
                    this.currentUser = currentUser;
                    this.domains = domains;
                    this.registrations = registrations;
                }
            });

        this._authService.currentUser$
            .pipe(
                switchMap(response => {
                    if (response) return this._userService.fetchUserFeedback(response._id);
                    return EMPTY;
                })
            )
            .subscribe({
                next: response => {
                    console.log(response);

                    this.feedbacks = response;
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

    getDomainName(domainId: string): string {
        return this._domainService.getDomainById(domainId).name;
    }

    hasUserRegistered(eventId: string): boolean {
        const index = this.registrations.findIndex(r => r.eventId === eventId && r.userId === this.currentUser?._id);
        return index === -1 ? false : true;
    }

    hasUserGivenFeedback(eventId: string): boolean {
        const isFeedbackPresentForEvent: Feedback | undefined = this.feedbacks.find(f => f.eventId === eventId);
        if (isFeedbackPresentForEvent) return true;
        else return false;
    }

    deleteEvent(eventId: string, index: number) {
        this._matDialog
            .open(ConfirmDialogComponent, {
                disableClose: true,
                panelClass: 'confirm-dialog'
            })
            .afterClosed()
            .pipe(
                switchMap(result => {
                    if (result) {
                        this._loaderService.show();
                        return this._eventService.deleteEvent(eventId, index);
                    }
                    return EMPTY;
                })
            )
            .subscribe({
                next: response => {
                    this._loaderService.show();
                    if (response) this._snackbar.open('Event deleted successfully', SNACKBAR_ACTION.SUCCESS);
                    else this._snackbar.open('Error while deleting event', SNACKBAR_ACTION.ERROR);
                }
            });
    }

    registerEvent(eventId: string) {
        this._router.navigate([`/events/${eventId}`]);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
