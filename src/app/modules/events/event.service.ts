import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL_MAP } from '../../core/app.constants';
import { CreateEventPayload } from '../../core/app.payload';
import { Event } from '../../core/app.models';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private _http = inject(HttpClient);

    getEvents(): Observable<Event[]> {
        return this._http
            .get<{ message: string; data: Event[] }>(API_URL_MAP.EVENTS)
            .pipe(map(response => response.data));
    }

    getEvent(eventId: string): Observable<Event> {
        return this._http
            .get<{ message: string; data: Event }>(`${API_URL_MAP.EVENTS}/${eventId}`)
            .pipe(map(response => response.data));
    }

    createEvent(payload: CreateEventPayload): Observable<Event> {
        return this._http
            .post<{ message: string; data: Event }>(API_URL_MAP.EVENTS, payload)
            .pipe(map(response => response.data));
    }
}
