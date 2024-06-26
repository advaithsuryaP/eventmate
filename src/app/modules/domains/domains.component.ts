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
import { EMPTY, Subject, combineLatest, switchMap, takeUntil, tap } from 'rxjs';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomainService } from './domain.service';
import { SaveDomainPayload } from '../../core/app.payload';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../core/app.constants';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';
import { LoaderService } from '../../core/services/loader.service';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
    editDomainId: string = '';

    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    private _matDialog = inject(MatDialog);
    private _snackbar = inject(MatSnackBar);
    private _announcer = inject(LiveAnnouncer);
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

    editDomain(domainId: string, index: number) {
        this.editDomainId = domainId;
        const domainToEdit: Domain = this.domains[index];
        this.domainForm.patchValue({
            name: domainToEdit.name,
            description: domainToEdit.description
        });
        const interestsControl = <FormArray>this.domainForm.controls.interests;
        interestsControl.clear();
        domainToEdit.interests.forEach(interest => interestsControl.push(new FormControl<string>(interest)));
    }

    deleteDomain(domainId: string, index: number): void {
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
                        return this._domainService.deleteDomain(domainId, index);
                    }
                    return EMPTY;
                })
            )
            .subscribe({
                next: response => {
                    this._loaderService.hide();
                    if (response) this._snackbar.open('Domain deleted successfully', SNACKBAR_ACTION.SUCCESS);
                    else this._snackbar.open('Error while deleting domain', SNACKBAR_ACTION.ERROR);
                }
            });
    }
    resetForm() {
        this.editDomainId = '';
        const interestsControl = <FormArray>this.domainForm.controls.interests;
        interestsControl.clear();
        this.domainForm.reset();
    }

    saveDomain(): void {
        if (this.domainForm.valid) {
            this._loaderService.show();
            const payload: SaveDomainPayload = this.domainForm.getRawValue();
            if (this.editDomainId) {
                this._domainService
                    .updateDomain(this.editDomainId, payload)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: response => {
                            this._loaderService.hide();
                            this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                        }
                    });
            } else {
                this._domainService
                    .createDomain(payload)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: response => {
                            this._loaderService.hide();
                            this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                        }
                    });
            }
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
            this._announcer.announce(`Removed ${interest}`);
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
