import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateUserPayload, LoginUserPayload } from '../models/app.payload';
import { API_URL_MAP } from '../constants/app.constants';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { CurrentUser } from '../models/app.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _token: string | null = null;

    private _router = inject(Router);
    private _http = inject(HttpClient);

    private _currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
    currentUserObs$ = this._currentUserSubject.asObservable();

    getToken(): string | null {
        return this._token;
    }

    signInUser(payload: LoginUserPayload) {
        return this._http.post<{ message: string; data: CurrentUser }>(API_URL_MAP.LOGIN_USER, payload).subscribe({
            next: response => {
                this._token = response.data.token;
                this._currentUserSubject.next(response.data);
                this._router.navigate(['/']);
            }
        });
    }

    signOutUser() {
        this._token = null;
        this._currentUserSubject.next(null);
        this._router.navigate(['/auth']);
    }

    registerUser(payload: CreateUserPayload) {
        return this._http.post<{ message: string; data: string }>(API_URL_MAP.REGISTER_USER, payload).subscribe({
            next: response => {
                this._router.navigate(['/auth']);
            }
        });
    }
}
