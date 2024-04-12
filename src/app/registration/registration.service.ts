import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL_MAP } from '../core/constants/app.constants';
import { Registration } from '../core/models/app.models';
import { RegisterEventPayload } from '../core/models/app.payload';

@Injectable({
    providedIn: 'root'
})
export class RegistrationService {
    private _http = inject(HttpClient);

    registerEvent(payload: RegisterEventPayload): Observable<string> {
        return this._http
            .post<{ message: string; data: Registration }>(API_URL_MAP.REGISTER_EVENT, payload)
            .pipe(map(response => response.message));
    }

    getRegistrations(): Observable<Registration[]> {
        return this._http
            .get<{ message: string; data: Registration[] }>(`${API_URL_MAP.REGISTER_EVENT}`)
            .pipe(map(response => response.data));
    }
}
