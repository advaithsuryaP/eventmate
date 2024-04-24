import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL_MAP } from '../../core/app.constants';
import { Feedback, Registration, User } from '../../core/app.models';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { GetEventMatesPayload, SubmitFeedbackPayload } from '../../core/app.payload';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _users: User[] = [];
    private _userSubject = new BehaviorSubject<User[]>([]);
    users$ = this._userSubject.asObservable();

    private _http = inject(HttpClient);

    fetchUsers(): Observable<User[]> {
        return this._http.get<{ message: string; data: User[] }>(API_URL_MAP.USERS).pipe(
            map(response => {
                this._users = response.data;
                this._userSubject.next(this._users.slice());
                return response.data;
            })
        );
    }

    submitFeedback(payload: SubmitFeedbackPayload): Observable<string> {
        return this._http
            .post<{ message: string; data: Feedback }>(API_URL_MAP.FEEDBACKS, payload)
            .pipe(map(response => response.message));
    }

    fetchUserRegistrations$(userId: string): Observable<Registration[]> {
        let httpParams = new HttpParams();
        httpParams = httpParams.append('userId', userId);
        return this._http
            .get<{ message: string; data: Registration[] }>(API_URL_MAP.REGISTRATIONS, {
                params: httpParams
            })
            .pipe(map(response => response.data));
    }

    fetchUserFeedback$(userId: string): Observable<Feedback[]> {
        let httpParams = new HttpParams();
        httpParams = httpParams.append('userId', userId);
        return this._http
            .get<{ message: string; data: Feedback[] }>(API_URL_MAP.GET_USER_FEEDBACK, { params: httpParams })
            .pipe(map(response => response.data));
    }

    fetchEventmateRecommendations(payload: GetEventMatesPayload): Observable<Registration[]> {
        return this._http
            .post<{ message: string; data: Registration[] }>(`${API_URL_MAP.GET_EVENTMATES_RECOMMENDATIONS}`, payload)
            .pipe(map(response => response.data));
    }
}
