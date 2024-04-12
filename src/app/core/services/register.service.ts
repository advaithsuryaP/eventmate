import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL_MAP } from '../constants/app.constants';
import { RegisterEventPayload } from '../models/app.payload';
import { Register } from '../models/app.models';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RegisterService {
    private _http = inject(HttpClient);

    registerEvent(payload: RegisterEventPayload): Observable<string> {
        return this._http
            .post<{ message: string; data: Register }>(API_URL_MAP.REGISTER_EVENT, payload)
            .pipe(map(response => response.message));
    }
}
