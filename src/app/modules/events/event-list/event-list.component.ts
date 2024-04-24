import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { DomainService } from '../../domains/domain.service';
import { EventService } from '../event.service';
import { Domain, Event, Registration, User } from '../../../core/app.models';
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
import { UserService } from '../../users/user.service';

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
        MatButtonModule,
        MatDividerModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatDatepickerModule
    ],
    templateUrl: './event-list.component.html',
    styleUrl: './event-list.component.css'
})
export default class EventListComponent implements OnInit, OnDestroy {
    users: User[] = [];
    events: Event[] = [];
    domains: Domain[] = [];
    registrations: Registration[] = [];
    currentUser!: User | null;

    private _router = inject(Router);
    private _snackbar = inject(MatSnackBar);
    private _authService = inject(AuthService);
    private _userService = inject(UserService);
    private _eventService = inject(EventService);
    private _domainService = inject(DomainService);

    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        combineLatest([
            this._userService.users$,
            this._authService.currentUser$,
            this._domainService.domains$,
            this._eventService.events$,
            this._eventService.registrations$
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ([users, currentUser, domains, events, registrations]) => {
                    this.users = users;
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

    getDomainNameById(domainId: string): string {
        return this.domains.find(d => d._id === domainId)?.name ?? 'Unknown Domain';
    }

    getUsernameById(userId: string): string {
        return this.users.find(u => u._id === userId)?.username ?? 'Unknown User';
    }

    hasUserRegistered(eventId: string): boolean {
        const index = this.registrations.findIndex(r => r.eventId === eventId && r.userId === this.currentUser?._id);
        return index === -1 ? false : true;
    }

    deleteEvent(eventId: string, index: number) {
        this._eventService.deleteEvent(eventId, index).subscribe({
            next: response => {
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
