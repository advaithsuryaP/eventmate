import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL_MAP } from '../../core/app.constants';
import { User } from '../../core/app.models';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _users: User[] = [];
    private _userSubject = new BehaviorSubject<User[]>([]);
    users$ = this._userSubject.asObservable();

    private _http = inject(HttpClient);

    getUsers(): Observable<User[]> {
        return this._http.get<{ message: string; data: User[] }>(API_URL_MAP.USERS).pipe(
            map(response => {
                this._users = response.data;
                this._userSubject.next(this._users.slice());
                return response.data;
            })
        );
    }
}
