import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { EventService } from '../event.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { Subject, combineLatest, filter, map, takeUntil } from 'rxjs';
import { DomainService } from '../../domains/domain.service';
import { Domain, User } from '../../../core/app.models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { CreateEventPayload } from '../../../core/app.payload';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-event-edit',
    standalone: true,
    imports: [
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
    templateUrl: './event-edit.component.html'
})
export default class EventEditComponent implements OnInit, OnDestroy {
    private _router = inject(Router);
    private _fb = inject(FormBuilder);
    private _authService = inject(AuthService);
    private _eventService = inject(EventService);
    private _domainService = inject(DomainService);

    domains: Domain[] = [];

    private readonly RANDOM_IMAGE: string = 'https://picsum.photos/300/300';

    private _unsubscribeAll: Subject<null> = new Subject();

    eventForm = new FormGroup({
        image: this._fb.control<string>(this.RANDOM_IMAGE, { validators: [Validators.required], nonNullable: true }),
        title: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        description: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        location: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        date: this._fb.control<Date>(new Date(), { validators: [Validators.required], nonNullable: true }),
        startTime: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        endTime: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        domainId: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true }),
        creatorId: this._fb.control<string>('', { validators: [Validators.required], nonNullable: true })
    });

    ngOnInit(): void {
        combineLatest([
            this._authService.currentUserObs$.pipe(
                filter(response => response !== null),
                map(response => <User>response)
            ),
            this._domainService.domainsObs$
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ([user, domains]) => {
                    this.eventForm.patchValue({ creatorId: user._id });
                    this.domains = domains;
                }
            });
    }

    getDomainInterests(domainId: string | undefined): string[] {
        let interests: string[] = [];
        if (domainId) interests = this.domains.find(d => d._id === domainId)!.interests;
        return interests;
    }

    createEvent(): void {
        if (this.eventForm.valid) {
            const payload: CreateEventPayload = this.eventForm.getRawValue();
            payload.image = `${this.RANDOM_IMAGE}?random=${this._eventService.getLatestEventCount()}`;
            this._eventService.createEvent(payload).subscribe({
                next: response => {
                    this._router.navigate(['/events']);
                }
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
