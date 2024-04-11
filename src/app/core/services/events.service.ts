import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL_MAP } from '../constants/app.constants';
import { Event } from '../models/app.models';
import { CreateEventPayload } from '../models/app.payload';

@Injectable({
    providedIn: 'root'
})
export class EventsService {
    private _http = inject(HttpClient);

    getEvents(): Observable<Event[]> {
        return this._http
            .get<{ message: string; data: Event[] }>(API_URL_MAP.EVENTS)
            .pipe(map(response => response.data));
    }

    getEvent(eventId: string): Observable<Event> {
        return this._http
            .get<{ message: string; data: Event }>(`${API_URL_MAP.EVENT}/${eventId}`)
            .pipe(map(response => response.data));
    }

    createEvent(payload: CreateEventPayload): Observable<Event> {
        return this._http
            .post<{ message: string; data: Event }>(API_URL_MAP.EVENTS, payload)
            .pipe(map(response => response.data));
    }
}
