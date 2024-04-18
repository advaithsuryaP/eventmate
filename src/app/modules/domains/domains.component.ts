import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Domain } from '../../core/app.models';
import { NgFor, UpperCasePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomainService } from './domain.service';
import { CreateDomainPayload } from '../../core/app.payload';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../core/app.constants';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';

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
    isLoading: boolean = false;
    domains: Domain[] = [];

    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    private _snackbar = inject(MatSnackBar);
    private announcer = inject(LiveAnnouncer);
    private _domainService = inject(DomainService);
    private _unsubscribeAll: Subject<null> = new Subject();

    domainForm = new FormGroup({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        description: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        interests: new FormArray<FormControl<string>>([], { validators: [Validators.required] })
    });

    ngOnInit(): void {
        this._domainService.domainsObs$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: response => (this.domains = response)
        });
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
        // this.isLoading = true;
        // this._registrationService.deleteRegistration(registrationId).subscribe({
        //     next: response => {
        //         if (response.data.deletedCount === 1) {
        //             this._snackbar.open(response.message, SNACKBAR_ACTION.SUCCESS);
        //             this.registrations.splice(index, 1);
        //         } else {
        //             this._snackbar.open('Error while cancelling the registration', SNACKBAR_ACTION.ERROR);
        //         }
        //         this.isLoading = false;
        //     }
        // });

        this.isLoading = true;
        this._domainService.deleteDomain(domainId).subscribe({
            next: response => {
                if (response.data.deletedCount === 1) {
                    this._snackbar.open(response.message, SNACKBAR_ACTION.SUCCESS);
                    this.domains.splice(index, 1);
                } else {
                    this._snackbar.open('Error while deleting domain', SNACKBAR_ACTION.ERROR);
                }
                this.isLoading = false;
            }
        });
    }

    createDomain(): void {
        if (this.domainForm.valid) {
            const payload: CreateDomainPayload = this.domainForm.getRawValue();
            this._domainService.createDomain(payload).subscribe({
                next: response => {
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
