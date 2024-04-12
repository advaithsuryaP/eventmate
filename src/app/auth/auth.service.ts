import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SignInUserPayload, SignUpUserPayload } from '../core/app.payload';
import { API_URL_MAP, SNACKBAR_ACTION, STORAGE_KEY_MAP } from '../core/app.constants';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../core/app.models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenTimer!: any;
    private _token: string | null = null;

    private _router = inject(Router);
    private _http = inject(HttpClient);
    private _snackbar = inject(MatSnackBar);

    private _currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUserObs$ = this._currentUserSubject.asObservable();

    getToken(): string | null {
        return this._token;
    }

    signInUser(payload: SignInUserPayload): Observable<string> {
        return this._http
            .post<{ message: string; data: User; expiresIn: number; token: string }>(API_URL_MAP.SIGNIN_USER, payload)
            .pipe(
                map(response => {
                    // Populate the token field
                    this._token = response.token;

                    // Populate the current user subject
                    this._currentUserSubject.next(response.data);

                    // Store the login information in session storage
                    sessionStorage.setItem(STORAGE_KEY_MAP.TOKEN, response.token);
                    sessionStorage.setItem(STORAGE_KEY_MAP.CURRENT_USER, JSON.stringify(response.data));

                    const now = new Date();
                    const tokenValidUntil: Date = new Date(now.getTime() + response.expiresIn * 1000);
                    sessionStorage.setItem(STORAGE_KEY_MAP.TOKEN_VALID_UNTIL, tokenValidUntil.toISOString());

                    // Set Auth-timer for auto-logout
                    this.setAuthTimer(response.expiresIn);

                    return response.message;
                })
            );
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this._snackbar.open('Your session has expired. Please log in again to continue.', SNACKBAR_ACTION.WARNING);
            this.signOutUser();
        }, duration * 1000);
    }

    autoSignIn(): void {
        const authData = this.getAuthData();
        if (authData) {
            /**
             * Calculate the time difference between now and the `tokenValidUntil` time
             * If the time difference is more than 0, ie.. token expiry is in the future, ie.. token is stll valid
             *
             */
            const now = new Date();
            const tokenExpiresIn = authData.tokenValidUntil.getTime() - now.getTime();
            if (tokenExpiresIn > 0) {
                /**
                 * Mimick the sign-in experience by updating the in-house
                 * `token` and current user information from session storage
                 */
                this._token = authData.token;
                this._currentUserSubject.next(authData.currentUser);

                /**
                 * Reset the auth timer with new tokenExpiresIn to
                 * recalculate when to log the user out.
                 */
                this.setAuthTimer(tokenExpiresIn / 1000);
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

    private clearAuthData(): void {
        sessionStorage.removeItem(STORAGE_KEY_MAP.TOKEN);
        sessionStorage.removeItem(STORAGE_KEY_MAP.CURRENT_USER);
        sessionStorage.removeItem(STORAGE_KEY_MAP.TOKEN_VALID_UNTIL);
    }

    private getAuthData(): null | { token: string; currentUser: User; tokenValidUntil: Date } {
        const token = sessionStorage.getItem(STORAGE_KEY_MAP.TOKEN);
        const currentUser = sessionStorage.getItem(STORAGE_KEY_MAP.CURRENT_USER);
        const tokenValidUntil = sessionStorage.getItem(STORAGE_KEY_MAP.TOKEN_VALID_UNTIL);
        if (!token || !currentUser || !tokenValidUntil) return null;

        return {
            token: token,
            currentUser: JSON.parse(currentUser),
            tokenValidUntil: new Date(tokenValidUntil)
        };
    }

    signUpUser(payload: SignUpUserPayload): Observable<string> {
        return this._http
            .post<{ message: string }>(API_URL_MAP.SIGNUP_USER, payload)
            .pipe(map(response => response.message));
    }
}
