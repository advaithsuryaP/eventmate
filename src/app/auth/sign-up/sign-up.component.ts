import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { SignUpUserPayload } from '../../core/app.payload';
import { AuthService } from '../auth.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../core/app.constants';
import { LoaderService } from '../../core/services/loader.service';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [
        RouterLink,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        ReactiveFormsModule
    ],
    templateUrl: './sign-up.component.html'
})
export default class SignUpComponent {
    showPassword: boolean = false;

    private _router = inject(Router);
    private _snackbar = inject(MatSnackBar);
    private _authService = inject(AuthService);
    private _loaderService = inject(LoaderService);

    signUpForm = new FormGroup({
        email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        username: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(4)]
        }),
        isAdmin: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
        isFlagged: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] })
    });

    get controls() {
        return this.signUpForm.controls;
    }

    signUp(): void {
        if (this.signUpForm.valid) {
            const payload: SignUpUserPayload = this.signUpForm.getRawValue();
            this._authService.signUpUser(payload).subscribe({
                next: response => {
                    this._loaderService.hide();
                    this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                    this._router.navigate(['/auth']);
                }
            });
        }
    }
}
