import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { SignInUserPayload } from '../../core/app.payload';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../core/app.constants';
import { LoaderService } from '../../core/services/loader.service';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
    templateUrl: './sign-in.component.html'
})
export default class SignInComponent {
    showPassword: boolean = false;

    private _router = inject(Router);
    private _snackbar = inject(MatSnackBar);
    private _authService = inject(AuthService);
    private _loaderService = inject(LoaderService);

    signInForm = new FormGroup({
        email: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
        }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });

    get controls() {
        return this.signInForm.controls;
    }

    signIn(): void {
        if (this.signInForm.valid) {
            this._loaderService.show();
            const payload: SignInUserPayload = this.signInForm.getRawValue();
            this._authService.signInUser(payload).subscribe({
                next: response => {
                    this._loaderService.hide();
                    this._snackbar.open(response, SNACKBAR_ACTION.SUCCESS);
                    this._router.navigate(['/']);
                }
            });
        }
    }
}
