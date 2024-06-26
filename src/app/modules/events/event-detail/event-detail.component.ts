import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, switchMap, combineLatest, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { SNACKBAR_ACTION } from '../../../core/app.constants';
import { Domain, Event, User } from '../../../core/app.models';
import { RegisterEventPayload } from '../../../core/app.payload';
import { DomainService } from '../../domains/domain.service';
import { EventService } from '../event.service';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
    selector: 'app-event-detail',
    standalone: true,
    imports: [MatCardModule, DatePipe, MatButtonModule, RouterLink, MatChipsModule, MatIconModule, MatTooltipModule],
    templateUrl: './event-detail.component.html',
    styleUrl: './event-detail.component.css'
})
export default class EventDetailComponent implements OnInit, OnDestroy {
    selectedInterest: string = '';

    private _router = inject(Router);
    private _route = inject(ActivatedRoute);
    private _authService = inject(AuthService);
    private _eventService = inject(EventService);
    private _snackbarService = inject(MatSnackBar);
    private _domainService = inject(DomainService);
    private _loaderService = inject(LoaderService);

    event!: Event;
    domains: Domain[] = [];
    currentUser: User | null = null;

    private _unsubscribeAll: Subject<null> = new Subject();
    ngOnInit(): void {
        this._loaderService.show();
        this._route.paramMap
            .pipe(
                switchMap(paramMap => {
                    const eventId: string = paramMap.get('eventId') ?? '';
                    return combineLatest([
                        this._authService.currentUser$,
                        this._domainService.domains$,
                        this._eventService.getEvent(eventId)
                    ]);
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: ([currentUser, domains, event]) => {
                    this._loaderService.hide();
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
                domainId: this.event.domainId,
                eventMates: [] // This will be empty initially
            };
            this._eventService.registerEvent(payload).subscribe({
                next: response => {
                    this._router.navigate(['/events']);
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
