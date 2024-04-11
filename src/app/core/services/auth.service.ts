import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateUserPayload, LoginUserPayload } from '../models/app.payload';
import { API_URL_MAP } from '../constants/app.constants';
import { tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _token?: string;

    private _http = inject(HttpClient);

    getToken(): string | undefined {
        return this._token;
    }

    signInUser(payload: LoginUserPayload) {
        return this._http.post<{ message: string; token: string }>(API_URL_MAP.LOGIN_USER, payload).pipe(
            tap(response => {
                this._token = response.token;
            })
        );
    }

    registerUser(payload: CreateUserPayload) {
        return this._http.post<{ message: string; data: string }>(API_URL_MAP.REGISTER_USER, payload);
    }
}
