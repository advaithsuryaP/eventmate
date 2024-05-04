import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [
        NgClass,
        FormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatDialogContent,
        MatDialogActions,
        MatFormFieldModule
    ],
    template: `
        <mat-dialog-content>
            <div class="d-flex flex-column justify-content-center align-items-center">
                <div class="text-primary mat-headline-6 mb-1">Are you sure you want to proceed?</div>

                <div class="mat-subtitle-2 d-flex justify-content-center mb-2">
                    This action cannot be
                    <span class="text-danger mx-1">undone.</span>
                </div>

                <img src="assets/images/confirm-choice.svg" alt="confirm-action" height="180" class="mb-2" />

                <div class="input-group">
                    <span class="input-group-text">
                        <mat-icon [ngClass]="[isUserConfirmationValid() ? 'text-success' : 'text-primary']">
                            pattern
                        </mat-icon>
                    </span>
                    <input
                        type="text"
                        [(ngModel)]="confirmText"
                        placeholder="Enter confirm to continue"
                        class="form-control border-2"
                        [ngClass]="[isUserConfirmationValid() ? 'border-success' : 'border-dark-subtle']" />
                </div>

                <div class="mat-caption fw-medium mb-2">Enter the confirmation text to proceed with the action.</div>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button color="accent" (click)="closeDialog(false)">
                <mat-icon>close</mat-icon>
                CANCEL
            </button>
            <button
                mat-raised-button
                color="primary"
                (click)="closeDialog(true)"
                class="d-flex align-items-center"
                [disabled]="!isUserConfirmationValid()">
                <mat-icon>check</mat-icon>
                CONFIRM
            </button>
        </mat-dialog-actions>
    `,
    styles: [
        `
            input:focus {
                box-shadow: none;
            }
            ::ng-deep .confirm-dialog .mat-mdc-dialog-surface {
                border-radius: 5%;
            }
        `
    ]
})
export class ConfirmDialogComponent {
    confirmText: string = '';
    private _matDialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

    isUserConfirmationValid(): boolean {
        return this.confirmText.toLowerCase() === 'confirm' ? true : false;
    }

    closeDialog(result: boolean) {
        this._matDialogRef.close(result);
    }
}
