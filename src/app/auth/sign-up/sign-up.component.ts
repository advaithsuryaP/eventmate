import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { CreateUserPayload } from '../../core/app.payload';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.css'
})
export default class SignUpComponent {
    private _authService = inject(AuthService);

    registerForm = new FormGroup({
        email: new FormControl('', { nonNullable: true }),
        username: new FormControl('', { nonNullable: true }),
        password: new FormControl('', { nonNullable: true })
    });

    register() {
        const payload: CreateUserPayload = this.registerForm.getRawValue();
        this._authService.registerUser(payload);
    }
}
