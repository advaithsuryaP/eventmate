import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL_MAP } from '../core/app.constants';
import { Registration } from '../core/app.models';
import { FetchEventsPayload, RegisterEventPayload } from '../core/app.payload';

@Injectable({
    providedIn: 'root'
})
export class RegistrationService {
    private _http = inject(HttpClient);

    registerEvent(payload: RegisterEventPayload): Observable<string> {
        return this._http
            .post<{ message: string; data: Registration }>(API_URL_MAP.REGISTRATIONS, payload)
            .pipe(map(response => response.message));
    }

    getRegistrations(payload: FetchEventsPayload): Observable<Registration[]> {
        let httpParams = new HttpParams();
        if (payload.userId) httpParams = httpParams.append('userId', payload.userId);
        if (payload.eventId) httpParams = httpParams.append('eventId', payload.eventId); // to be used later

        return this._http
            .get<{ message: string; data: Registration[] }>(`${API_URL_MAP.REGISTRATIONS}`, { params: httpParams })
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
