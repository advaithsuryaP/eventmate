import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { CreateUserPayload } from '../../core/models/app.payload';
import { AuthService } from '../../core/services/auth.service';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export default class RegisterComponent {
    private _router = inject(Router);
    private _authService = inject(AuthService);

    registerForm = new FormGroup({
        email: new FormControl('', { nonNullable: true }),
        username: new FormControl('', { nonNullable: true }),
        password: new FormControl('', { nonNullable: true })
    });

    register() {
        const payload: CreateUserPayload = this.registerForm.getRawValue();
        this._authService.registerUser(payload).subscribe({
            next: response => {
                this._router.navigate(['/auth']);
            }
        });
    }
}
