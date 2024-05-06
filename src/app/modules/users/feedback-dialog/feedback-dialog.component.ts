import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Event } from '../../../core/app.models';
import { SubmitFeedbackPayload } from '../../../core/app.payload';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { NgClass } from '@angular/common';
import { UserService } from '../user.service';
import { LoaderService } from '../../../core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../../core/app.constants';

@Component({
    selector: 'app-feedback-dialog',
    standalone: true,
    imports: [
        NgClass,
        MatIconModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
        MatSliderModule,
        ReactiveFormsModule
    ],
    templateUrl: './feedback-dialog.component.html'
})
export class FeedbackDialogComponent {
    data: { userId: string; event: Event } = inject(MAT_DIALOG_DATA);

    private _snackbar = inject(MatSnackBar);
    private _userService = inject(UserService);
    private _loaderService = inject(LoaderService);
    private _matDialogRef = inject(MatDialogRef<FeedbackDialogComponent>);

    commentControl = new FormControl<string>('', { nonNullable: true });
    ratingControl = new FormControl<number>(1, { nonNullable: true, validators: [Validators.required] });

    submitFeedback(): void {
        const payload: SubmitFeedbackPayload = {
            eventId: this.data.event._id,
            comment: this.commentControl.value,
            rating: this.ratingControl.value,
            userId: this.data.userId
        };
        this._loaderService.show();
        this._userService.submitFeedback(payload).subscribe({
            next: response => {
                this._loaderService.hide();
                this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                this._matDialogRef.close(true);
            }
        });
    }
}
