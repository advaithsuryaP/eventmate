import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Registration } from '../../../core/app.models';
import { MatListModule, MatListOption } from '@angular/material/list';
import { UserService } from '../user.service';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-eventmate-selection',
    standalone: true,
    imports: [MatButtonModule, MatListModule, MatDialogModule, TitleCasePipe, MatDividerModule, DecimalPipe],
    templateUrl: './eventmate-selection.component.html'
})
export class EventmateSelectionComponent {
    data: { eventmates: Registration[]; isConfirmed: boolean } = inject(MAT_DIALOG_DATA);

    private _userService = inject(UserService);
    private _matDialogRef = inject(MatDialogRef<EventmateSelectionComponent>);

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
        this._matDialogRef.close(selectedEventmates);
    }
}
