import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateUserPayload, LoginUserPayload } from '../models/app.payload';
import { API_URL_MAP } from '../constants/app.constants';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _http = inject(HttpClient);

    signInUser(payload: LoginUserPayload) {
        return this._http.post(API_URL_MAP.REGISTER_USER, payload);
    }

    registerUser(payload: CreateUserPayload) {
        return this._http.post(API_URL_MAP.REGISTER_USER, payload);
    }
}
