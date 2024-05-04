import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { EventService } from '../event.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { EMPTY, Subject, combineLatest, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import { DomainService } from '../../domains/domain.service';
import { Domain, User } from '../../../core/app.models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { SaveEventPayload } from '../../../core/app.payload';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../../core/app.constants';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-event-edit',
    standalone: true,
    imports: [
        FormsModule,
        MatIconModule,
        MatChipsModule,
        MatInputModule,
        MatRadioModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    providers: [DecimalPipe],
    templateUrl: './event-edit.component.html'
})
export default class EventEditComponent implements OnInit, OnDestroy {
    private _router = inject(Router);
    private _fb = inject(FormBuilder);
    private _route = inject(ActivatedRoute);
    private _snackbar = inject(MatSnackBar);
    private _decimalPipe = inject(DecimalPipe);
    private _authService = inject(AuthService);
    private _eventService = inject(EventService);
    private _domainService = inject(DomainService);

    domains: Domain[] = [];
    isEditMode: boolean = false;
    eventId: string | null = null;

    startTime: string = '';
    endTime: string = '';

    private readonly RANDOM_IMAGE: string = 'https://picsum.photos/300/300';

    private _unsubscribeAll: Subject<null> = new Subject();

    eventForm = new FormGroup({
        image: this._fb.control<string>(this.RANDOM_IMAGE, { validators: [Validators.required], nonNullable: true }),
        title: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        description: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        location: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        startDate: this._fb.control<Date>(new Date(), { validators: [Validators.required], nonNullable: true }),
        endDate: this._fb.control<Date>(new Date(), { validators: [Validators.required], nonNullable: true }),
        domainId: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        creatorId: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true })
    });

    ngOnInit(): void {
        const route$ = this._route.paramMap.pipe(
            switchMap(paramMap => {
                this.eventId = paramMap.get('eventId');
                if (this.eventId) {
                    return this._eventService.getEvent(this.eventId).pipe(
                        tap(response => {
                            this.startTime = this._getTimeFromDate(response.startDate);
                            this.endTime = this._getTimeFromDate(response.endDate);
                            this.isEditMode = true;
                            this.eventForm.setValue({
                                image: response.image,
                                title: response.title,
                                description: response.description,
                                location: response.location,
                                startDate: response.startDate,
                                endDate: response.endDate,
                                domainId: response.domainId,
                                creatorId: response.creatorId
                            });
                        })
                    );
                }
                return EMPTY;
            })
        );

        const currentUser$ = this._authService.currentUser$.pipe(
            filter(response => response !== null),
            map(response => <User>response),
            tap(response => this.eventForm.patchValue({ creatorId: response._id }))
        );

        const domains$ = this._domainService.domains$.pipe(tap(response => (this.domains = response)));

        combineLatest([currentUser$, domains$, route$]).pipe(takeUntil(this._unsubscribeAll)).subscribe();
    }

    getDomainInterests(domainId: string | undefined): string[] {
        let interests: string[] = [];
        if (domainId) interests = this.domains.find(d => d._id === domainId)!.interests;
        return interests;
    }

    saveEvent(): void {
        if (this.eventForm.valid) {
            const payload: SaveEventPayload = this.eventForm.getRawValue();
            if (this.isEditMode) {
                payload.startDate = this._addTimeToDate(payload.startDate, this.startTime);
                payload.endDate = this._addTimeToDate(payload.endDate, this.endTime);
                this._eventService
                    .updateEvent(this.eventId!, payload)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: response => {
                            this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                            this._router.navigate(['/events']);
                        }
                    });
            } else {
                payload.image = `${this.RANDOM_IMAGE}?random=${this._eventService.getLatestEventCount()}`;
                this._eventService
                    .createEvent(payload)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: response => {
                            this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                            this._router.navigate(['/events']);
                        }
                    });
            }
        }
    }

    private _addTimeToDate(dateObj: Date, time: string): Date {
        const year: number = dateObj.getFullYear();
        const month: number = dateObj.getMonth();
        const day: number = dateObj.getDate();
        const hour: number = +time.split(':')[0];
        const minute: number = +time.split(':')[1];
        return new Date(year, month, day, hour, minute);
    }

    private _getTimeFromDate(date: Date): string {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedHours = this._decimalPipe.transform(hours, '2.0-0');
        const formattedMinutes = this._decimalPipe.transform(minutes, '2.0-0');
        return `${formattedHours}:${formattedMinutes}`;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
