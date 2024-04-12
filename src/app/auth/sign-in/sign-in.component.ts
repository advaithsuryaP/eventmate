import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { LoginUserPayload } from '../../core/models/app.payload';
import { AuthService } from '../../core/services/auth.service';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.css'
})
export default class SignInComponent {
    isLoading: boolean = false;
    private _authService = inject(AuthService);

    signInForm = new FormGroup({
        email: new FormControl('', { nonNullable: true }),
        password: new FormControl('', { nonNullable: true })
    });

    signIn() {
        const payload: LoginUserPayload = this.signInForm.getRawValue();
        this._authService.signInUser(payload);
    }
}
