import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, switchMap, combineLatest, takeUntil, filter, map, EMPTY, tap } from 'rxjs';
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
import { GetEventMatesPayload, UpdateRegistrationPayload } from '../../../core/app.payload';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { EventmateSelectionComponent } from '../eventmate-selection/eventmate-selection.component';
import { LoaderService } from '../../../core/services/loader.service';
import { FormsModule } from '@angular/forms';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog.component';

@Component({
    standalone: true,
    imports: [
        DatePipe,
        RouterLink,
        FormsModule,
        MatCardModule,
        UpperCasePipe,
        MatIconModule,
        TitleCasePipe,
        MatIconModule,
        MatChipsModule,
        MatButtonModule,
        MatTooltipModule,
        MatDividerModule,
        MatDividerModule,
        MatCheckboxModule,
        MatExpansionModule
    ],
    templateUrl: './user-detail.component.html'
})
export default class UserDetailComponent implements OnInit, OnDestroy {
    isInterestChanged: boolean = false;
    private _selectedInterest: string = '';

    currentUser!: User;

    users: User[] = [];
    events: Event[] = [];
    feedbacks: Feedback[] = [];
    eventMates: Registration[] = [];
    registrations: Registration[] = [];

    completedEvents: Event[] = [];

    private _matDialog = inject(MatDialog);
    private _snackbar = inject(MatSnackBar);
    private _authService = inject(AuthService);
    private _userService = inject(UserService);
    private _eventService = inject(EventService);
    private _domainService = inject(DomainService);
    private _loaderService = inject(LoaderService);

    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        this._loaderService.show();

        const combined$ = this._authService.currentUser$.pipe(
            filter(response => response !== null),
            map(response => <User>response),
            switchMap(currentUser => {
                return combineLatest([
                    this._eventService.events$,
                    this._userService.fetchUserRegistrations(currentUser._id)
                ]).pipe(
                    map(([events, userRegistrations]) => {
                        userRegistrations.forEach(ur => {
                            const eventId = ur.eventId;
                            const event = events.find(e => e._id === eventId);
                            if (event && event.eventStartsIn < 1) this.completedEvents.push(event);
                        });
                        this.events = events;
                        return userRegistrations;
                    })
                );
            }),
            map(userRegistrations => {
                return userRegistrations.filter(ur => {
                    const completedEvent = this.completedEvents.find(c => c._id === ur.eventId);
                    if (completedEvent) return false;
                    return true;
                });
            })
        );

        this._authService.currentUser$
            .pipe(
                filter(response => response !== null),
                map(response => <User>response),
                switchMap(currentUser => {
                    this.currentUser = currentUser;
                    return combineLatest([
                        this._userService.users$,
                        this._userService.fetchUserFeedback(this.currentUser._id),
                        combined$
                    ]);
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: ([users, feedbacks, validUserRegistrations]) => {
                    this._loaderService.hide();
                    this.users = users;
                    this.feedbacks = feedbacks;
                    this.registrations = validUserRegistrations;
                }
            });
    }

    getEvent(eventId: string): Event {
        return this._eventService.getEventById(eventId);
    }

    getDomain(domainId: string): Domain {
        return this._domainService.getDomainById(domainId);
    }

    cancelRegistration(registrationId: string, index: number) {
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
                        return this._eventService.cancelRegistration(registrationId);
                    }
                    return EMPTY;
                })
            )
            .subscribe({
                next: response => {
                    this._loaderService.hide();
                    if (response) {
                        this._snackbar.open('Registration cancelled successfully', SNACKBAR_ACTION.SUCCESS);
                        this.registrations.splice(index, 1);
                    } else this._snackbar.open('Error while cancelling the registration', SNACKBAR_ACTION.ERROR);
                }
            });
    }

    isRegistrationOpen(eventStartsIn: number): boolean {
        return eventStartsIn >= 2;
    }

    hasUserGivenFeedback(eventId: string): boolean {
        const isFeedbackPresentForEvent: Feedback | undefined = this.feedbacks.find(f => f.eventId === eventId);
        if (isFeedbackPresentForEvent) return true;
        else return false;
    }

    getUserFeedback(eventId: string): Feedback | undefined {
        const feedback = this.feedbacks.find(f => f.eventId === eventId);
        return feedback;
    }

    getEventRatingIcon(rating: number): string {
        const ratingJson: { [key: number]: string } = {
            1: 'looks_one',
            2: 'looks_two',
            3: 'looks_3',
            4: 'looks_4',
            5: 'looks_5'
        };
        return ratingJson[rating];
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
        this._loaderService.show();
        const payload: UpdateRegistrationPayload = {
            registrationId: registrationId,
            interests: [this._selectedInterest]
        };
        this._eventService.updateRegistration(payload).subscribe({
            next: response => {
                this._loaderService.hide();
                this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
            }
        });
    }

    openFeedbackDialog(completedEvent: Event) {
        this._matDialog
            .open(FeedbackDialogComponent, {
                data: {
                    userId: this.currentUser._id,
                    event: completedEvent
                }
            })
            .afterClosed()
            .pipe(
                switchMap(result => {
                    if (result)
                        return this._userService
                            .fetchUserFeedback(this.currentUser._id)
                            .pipe(tap(response => (this.feedbacks = response)));
                    return EMPTY;
                })
            )
            .subscribe();
    }

    getEventTitle(eventId: string): string {
        return this._eventService.getEventById(eventId).title;
    }

    getEventmates(eventId: string, interests: string[]): void {
        const payload: GetEventMatesPayload = {
            userId: this.currentUser._id,
            eventId: eventId,
            interests: interests
        };
        this._loaderService.show();
        this._userService.fetchEventmates(payload).subscribe({
            next: response => {
                this._loaderService.hide();
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
