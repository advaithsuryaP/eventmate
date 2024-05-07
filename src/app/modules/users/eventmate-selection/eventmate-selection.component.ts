import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Registration } from '../../../core/app.models';
import { MatListModule, MatListOption } from '@angular/material/list';
import { UserService } from '../user.service';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { LoaderService } from '../../../core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../../core/app.constants';
import { UpdateRegistrationPayload } from '../../../core/app.payload';
import { EventService } from '../../events/event.service';

@Component({
    selector: 'app-eventmate-selection',
    standalone: true,
    imports: [
        DecimalPipe,
        MatIconModule,
        MatListModule,
        TitleCasePipe,
        MatCardModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule
    ],
    templateUrl: './eventmate-selection.component.html'
})
export class EventmateSelectionComponent {
    data: { registrationId: string; registrations: Registration[]; selectedEventMates: string[]; allowEdit: boolean } =
        inject(MAT_DIALOG_DATA);

    private _matSnackbar = inject(MatSnackBar);
    private _userService = inject(UserService);
    private _eventService = inject(EventService);
    private _loaderService = inject(LoaderService);
    private _matDialogRef = inject(MatDialogRef<EventmateSelectionComponent>);

    isUserEventmate(userId: string): boolean {
        const eventMateFound = this.data.selectedEventMates.find(em => em === userId);
        if (eventMateFound) return true;
        else return false;
    }

    getUsername(userId: string): string {
        return this._userService.getUserById(userId).username;
    }

    getEmail(userId: string): string {
        return this._userService.getUserById(userId).email;
    }

    confirmEventmates(selectedOptions: MatListOption[]) {
        const selectedEventmates: string[] = [];
        selectedOptions.forEach(matListOption => {
            selectedEventmates.push(matListOption.value);
        });
        this._loaderService.show();
        const payload: UpdateRegistrationPayload = {
            eventMates: selectedEventmates
        };
        this._eventService.updateRegistration(this.data.registrationId, payload).subscribe({
            next: response => {
                this._loaderService.hide();
                this._matSnackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                this._matDialogRef.close(selectedEventmates);
            }
        });
    }
}
