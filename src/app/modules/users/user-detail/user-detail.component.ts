import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, switchMap, combineLatest, takeUntil, filter, map } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { SNACKBAR_ACTION } from '../../../core/app.constants';
import { User, Domain, Registration, Event, Feedback } from '../../../core/app.models';
import { DomainService } from '../../domains/domain.service';
import { EventService } from '../../events/event.service';
import { TitleCasePipe, DatePipe, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { GetEventMatesPayload, SubmitFeedbackPayload, UpdateRegistrationPayload } from '../../../core/app.payload';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { EventmateSelectionComponent } from '../eventmate-selection/eventmate-selection.component';

@Component({
    standalone: true,
    imports: [
        DatePipe,
        RouterLink,
        MatCardModule,
        UpperCasePipe,
        MatIconModule,
        TitleCasePipe,
        MatIconModule,
        MatChipsModule,
        MatButtonModule,
        MatTooltipModule,
        MatDividerModule,
        MatCheckboxModule,
        MatExpansionModule
    ],
    templateUrl: './user-detail.component.html'
})
export default class UserDetailComponent implements OnInit, OnDestroy {
    isLoading: boolean = false;
    isInterestChanged: boolean = false;
    private _selectedInterest: string = '';

    currentUser!: User;

    eventMates: Registration[] = [];

    users: User[] = [];
    events: Event[] = [];
    domains: Domain[] = [];
    feedbacks: Feedback[] = [];
    registrations: Registration[] = [];

    private _matDialog = inject(MatDialog);
    private _snackbar = inject(MatSnackBar);
    private _authService = inject(AuthService);
    private _userService = inject(UserService);
    private _eventService = inject(EventService);
    private _domainService = inject(DomainService);

    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        this.isLoading = true;
        this._authService.currentUser$
            .pipe(
                filter(response => response !== null),
                map(response => <User>response),
                switchMap(currentUser => {
                    this.currentUser = currentUser;
                    return combineLatest([
                        this._userService.users$,
                        this._eventService.events$,
                        this._domainService.domains$,
                        this._userService.fetchUserFeedback$(this.currentUser._id),
                        this._userService.fetchUserRegistrations$(this.currentUser._id)
                    ]);
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: ([users, events, domains, feedbacks, registrations]) => {
                    this.isLoading = false;
                    this.users = users;
                    this.events = events;
                    this.domains = domains;
                    this.feedbacks = feedbacks;
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

    unRegisterForEvent(registrationId: string, index: number) {
        this.isLoading = true;
        this._eventService.unRegisterEvent(registrationId).subscribe({
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

    /**
     * Reset the registration to the initial state
     */
    openPanelEvent(): void {
        this.eventMates = [];
        this.isInterestChanged = false;
        this._selectedInterest = '';
    }

    onChangeInterest(event: MatChipListboxChange) {
        if (event.value) {
            this._selectedInterest = event.value;
            this.isInterestChanged = true;
        }
    }

    updateInterest(registrationId: string): void {
        const payload: UpdateRegistrationPayload = {
            registrationId: registrationId,
            interests: [this._selectedInterest]
        };
        this._eventService.updateRegistration(payload).subscribe({
            next: response => {
                this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
            }
        });
    }

    submitFeedback(eventId: string) {
        const payload: SubmitFeedbackPayload = {
            userId: this.currentUser._id,
            eventId: eventId,
            comment: '',
            rating: 3
        };
        this._userService.submitFeedback(payload).subscribe({
            next: response => {
                this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
            }
        });
    }

    getEventTitleById(eventId: string): string {
        return this.events.find(e => e._id === eventId)?.title ?? 'Unknown Event';
    }

    getRecommendations(eventId: string, interests: string[]): void {
        const payload: GetEventMatesPayload = {
            userId: this.currentUser._id,
            eventId: eventId,
            interests: interests
        };
        this._userService.fetchEventmateRecommendations(payload).subscribe({
            next: response => {
                this._matDialog
                    .open(EventmateSelectionComponent, {
                        disableClose: true,
                        autoFocus: 'dialog',
                        width: '30%',
                        data: {
                            isConfirmed: false,
                            eventmates: response
                        }
                    })
                    .afterClosed()
                    .subscribe({
                        next: response => {
                            console.log(response);
                        }
                    });
            }
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
