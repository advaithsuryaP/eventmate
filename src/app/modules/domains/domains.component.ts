import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Domain, User } from '../../core/app.models';
import { NgFor, UpperCasePipe } from '@angular/common';
import { Subject, combineLatest, takeUntil, tap } from 'rxjs';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomainService } from './domain.service';
import { CreateDomainPayload } from '../../core/app.payload';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../core/app.constants';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
    selector: 'app-domains',
    standalone: true,
    imports: [
        NgFor,
        MatCardModule,
        UpperCasePipe,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatChipsModule,
        MatListModule,
        MatIconModule,
        ReactiveFormsModule
    ],
    templateUrl: './domains.component.html'
})
export default class DomainsComponent implements OnInit, OnDestroy {
    domains: Domain[] = [];
    currentUser: User | null = null;

    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    private _snackbar = inject(MatSnackBar);
    private announcer = inject(LiveAnnouncer);
    private _authService = inject(AuthService);
    private _domainService = inject(DomainService);
    private _loaderService = inject(LoaderService);
    private _unsubscribeAll: Subject<null> = new Subject();

    domainForm = new FormGroup({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        description: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        interests: new FormArray<FormControl<string>>([], { validators: [Validators.required] })
    });

    ngOnInit(): void {
        combineLatest([
            this._authService.currentUser$.pipe(tap(response => (this.currentUser = response))),
            this._domainService.domains$.pipe(tap(response => (this.domains = response)))
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();
    }

    getIndexBgColor(index: number): string {
        const INDEX_JSON: { [key: number]: string } = {
            0: 'bg-primary-subtle',
            1: 'bg-danger-subtle',
            2: 'bg-success-subtle',
            3: 'bg-warning-subtle',
            4: 'bg-info-subtle',
            5: 'bg-dark-subtle'
        };
        return INDEX_JSON[index];
    }

    editDomain(domainId: string) {}

    deleteDomain(domainId: string, index: number): void {
        this._loaderService.show();
        this._domainService.deleteDomain(domainId, index).subscribe({
            next: response => {
                this._loaderService.hide();
                if (response) this._snackbar.open('Domain deleted successfully', SNACKBAR_ACTION.SUCCESS);
                else this._snackbar.open('Error while deleting domain', SNACKBAR_ACTION.ERROR);
            }
        });
    }

    createDomain(): void {
        if (this.domainForm.valid) {
            this._loaderService.show();
            const payload: CreateDomainPayload = this.domainForm.getRawValue();
            this._domainService.createDomain(payload).subscribe({
                next: response => {
                    this._loaderService.hide();
                    this.domainForm.reset();
                    this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                }
            });
        }
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our interest
        if (value) {
            this.domainForm.controls.interests.push(new FormControl<string>(value, { nonNullable: true }));
        }

        // Clear the input value
        event.chipInput!.clear();
    }

    remove(interest: string): void {
        const interestControl = this.domainForm.controls.interests as FormArray;
        const index = interestControl.value.indexOf(interest);

        if (index >= 0) {
            interestControl.removeAt(index);
            this.announcer.announce(`Removed ${interest}`);
        }
    }

    edit(interest: string, event: MatChipEditedEvent) {
        const value = event.value.trim();

        // Remove interest if it no longer has a name
        if (!value) {
            this.remove(interest);
            return;
        }

        // Edit existing interest
        const interestControl = this.domainForm.controls.interests as FormArray;
        const interests = interestControl.value;
        const index = interests.indexOf(interest);
        if (index >= 0) {
            interests[index] = value;
            interestControl.patchValue(interests);
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
