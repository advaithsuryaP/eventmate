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
    private tokenTimer!: any;
    private _token: string | null = null;

    private _router = inject(Router);
    private _http = inject(HttpClient);

    private _currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
    currentUserObs$ = this._currentUserSubject.asObservable();

    getToken(): string | null {
        return this._token;
    }

    signInUser(payload: LoginUserPayload) {
        return this._http.post<{ message: string; data: CurrentUser }>(API_URL_MAP.SIGNIN_USER, payload).subscribe({
            next: response => {
                this._token = response.data.token;
                this._currentUserSubject.next(response.data);
                const now = new Date();
                const expirationDate = new Date(now.getTime() + response.data.expiresIn * 1000);
                this.saveAuthData(response.data.userId, this._token, expirationDate);
                this.setAuthTimer(response.data.expiresIn);
                this._router.navigate(['/']);
            }
        });
    }

    private setAuthTimer(duration: number) {
        console.log('Setting timer: ', +duration);

        this.tokenTimer = setTimeout(() => {
            this.signOutUser();
        }, duration * 1000);
    }

    autoSignIn(): void {
        const authData = this.getAuthData();
        if (authData) {
            const now = new Date();
            const expiresIn = authData.expiration.getTime() - now.getTime();
            if (expiresIn > 0) {
                this._token = authData.token;
                this.setAuthTimer(expiresIn / 1000);
                // this._currentUserSubject.next({
                //     userId: authData.userId,

                // })
            }
        }
    }

    signOutUser() {
        this._token = null;
        this._currentUserSubject.next(null);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this._router.navigate(['/auth']);
    }

    private saveAuthData(userId: string, token: string, expiration: Date): void {
        localStorage.setItem('userId', userId);
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expiration.toISOString());
    }

    private clearAuthData(): void {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
    }

    private getAuthData(): void | { userId: string; token: string; expiration: Date } {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const expiration = localStorage.getItem('expiration');
        if (!token || !expiration || !userId) {
            return;
        }
        return {
            token: token,
            userId: userId,
            expiration: new Date(expiration)
        };
    }

    registerUser(payload: CreateUserPayload) {
        return this._http.post<{ message: string; data: string }>(API_URL_MAP.SIGNUP_USER, payload).subscribe({
            next: _ => {
                this._router.navigate(['/auth']);
            }
        });
    }
}
