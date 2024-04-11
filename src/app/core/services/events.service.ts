import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL_MAP } from '../constants/app.constants';
import { Event } from '../models/app.models';

@Injectable({
    providedIn: 'root'
})
export class EventsService {
    private _http = inject(HttpClient);

    getEvents(): Observable<Event[]> {
        return this._http
            .get<{ message: string; data: Event[] }>(API_URL_MAP.GET_EVENTS)
            .pipe(map(response => response.data));
    }
}
