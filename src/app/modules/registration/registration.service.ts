import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { API_URL_MAP } from '../../core/app.constants';
import { Registration } from '../../core/app.models';
import { GetEventMatesPayload, RegisterEventPayload } from '../../core/app.payload';

@Injectable({
    providedIn: 'root'
})
export class RegistrationService {
    private _registrations: Registration[] = [];
    private _registrationSubject = new BehaviorSubject<Registration[]>([]);
    registrations$ = this._registrationSubject.asObservable();

    private _http = inject(HttpClient);

    registerEvent(payload: RegisterEventPayload): Observable<string> {
        return this._http.post<{ message: string; data: Registration }>(API_URL_MAP.REGISTRATIONS, payload).pipe(
            map(response => {
                this._registrations.push(response.data);
                this._registrationSubject.next(this._registrations.slice());
                return response.message;
            })
        );
    }

    fetchRegistrations(): Observable<Registration[]> {
        return this._http.get<{ message: string; data: Registration[] }>(`${API_URL_MAP.REGISTRATIONS}`).pipe(
            map(response => {
                this._registrations = response.data;
                this._registrationSubject.next(this._registrations.slice());
                return response.data;
            })
        );
    }

    fetchEventRegistrations(eventId: string): Observable<Registration[]> {
        let httpParams = new HttpParams();
        httpParams = httpParams.append('eventId', eventId);
        return this._http
            .get<{ message: string; data: Registration[] }>(API_URL_MAP.REGISTRATIONS, {
                params: httpParams
            })
            .pipe(map(response => response.data));
    }

    fetchEventMates(payload: GetEventMatesPayload): Observable<Registration[]> {
        return this._http
            .post<{ message: string; data: Registration[] }>(`${API_URL_MAP.REGISTRATIONS}/event-mates`, payload)
            .pipe(map(response => response.data));
    }

    deleteRegistration(
        registrationId: string
    ): Observable<{ message: string; data: { acknowledged: boolean; deletedCount: number } }> {
        return this._http.delete<{ message: string; data: { acknowledged: boolean; deletedCount: number } }>(
            `${API_URL_MAP.REGISTRATIONS}/${registrationId}`
        );
    }
}
