import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { API_URL_MAP } from '../../core/app.constants';
import { CreateEventPayload } from '../../core/app.payload';
import { Event } from '../../core/app.models';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private _events: Event[] = [];
    private _eventsSubject = new BehaviorSubject<Event[]>(this._events);
    events$ = this._eventsSubject.asObservable();

    private _http = inject(HttpClient);

    getEvents(): Observable<Event[]> {
        return this._http.get<{ message: string; data: Event[] }>(API_URL_MAP.EVENTS).pipe(
            map(response => {
                this._events = response.data;
                this._eventsSubject.next(this._events.slice());
                return response.data;
            })
        );
    }

    getLatestEventCount(): number {
        return this._events.length + 1;
    }

    getEvent(eventId: string): Observable<Event> {
        return this._http
            .get<{ message: string; data: Event }>(`${API_URL_MAP.EVENTS}/${eventId}`)
            .pipe(map(response => response.data));
    }

    createEvent(payload: CreateEventPayload): Observable<string> {
        return this._http.post<{ message: string; data: Event }>(API_URL_MAP.EVENTS, payload).pipe(
            map(response => {
                this._events.push(response.data);
                this._eventsSubject.next(this._events.slice());
                return response.message;
            })
        );
    }

    updateEvent(eventId: string, payload: CreateEventPayload): Observable<string> {
        return this._http.put<{ message: string; data: Event }>(`${API_URL_MAP.EVENTS}/${eventId}`, payload).pipe(
            map(response => {
                const indexToUpdate = this._events.findIndex(e => e._id == eventId);
                this._events[indexToUpdate] = response.data;
                this._eventsSubject.next(this._events.slice());
                return response.message;
            })
        );
    }

    deleteEvent(eventId: string, index: number): Observable<boolean> {
        return this._http
            .delete<{ message: string; data: { acknowledged: boolean; deletedCount: number } }>(
                `${API_URL_MAP.EVENTS}/${eventId}`
            )
            .pipe(
                map(response => {
                    if (response.data.deletedCount === 1) {
                        this._events.splice(index, 1);
                        this._eventsSubject.next(this._events.slice());
                        return true;
                    }
                    return false;
                })
            );
    }
}
