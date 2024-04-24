import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { API_URL_MAP } from '../../core/app.constants';
import { SaveEventPayload, RegisterEventPayload, UpdateRegistrationPayload } from '../../core/app.payload';
import { Event, Registration } from '../../core/app.models';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private _events: Event[] = [];
    private _eventsSubject = new BehaviorSubject<Event[]>([]);
    events$ = this._eventsSubject.asObservable().pipe(
        map(event =>
            event.map(e => {
                const daysLeftForEventToStart: number = this.calculateRamainingDaysToEvent(e);
                return {
                    ...e,
                    eventStartsIn: daysLeftForEventToStart,
                    registrationClosesIn: daysLeftForEventToStart - 1,
                    isRegistrationClosed: daysLeftForEventToStart <= 1
                };
            })
        )
    );

    private _registrations: Registration[] = [];
    private _registrationSubject = new BehaviorSubject<Registration[]>([]);
    registrations$ = this._registrationSubject.asObservable();

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

    createEvent(payload: SaveEventPayload): Observable<string> {
        return this._http.post<{ message: string; data: Event }>(API_URL_MAP.EVENTS, payload).pipe(
            map(response => {
                this._events.push(response.data);
                this._eventsSubject.next(this._events.slice());
                return response.message;
            })
        );
    }

    updateEvent(eventId: string, payload: SaveEventPayload): Observable<string> {
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

    registerEvent(payload: RegisterEventPayload): Observable<string> {
        return this._http.post<{ message: string; data: Registration }>(API_URL_MAP.REGISTRATIONS, payload).pipe(
            map(response => {
                this._registrations.push(response.data);
                this._registrationSubject.next(this._registrations.slice());
                return response.message;
            })
        );
    }

    unRegisterEvent(
        registrationId: string
    ): Observable<{ message: string; data: { acknowledged: boolean; deletedCount: number } }> {
        return this._http
            .delete<{ message: string; data: { acknowledged: boolean; deletedCount: number } }>(
                `${API_URL_MAP.REGISTRATIONS}/${registrationId}`
            )
            .pipe(
                tap(response => {
                    const indexToDelete = this._registrations.findIndex(r => r._id === registrationId);
                    if (indexToDelete !== -1) {
                        this._registrations.splice(indexToDelete, 1);
                        this._registrationSubject.next(this._registrations.slice());
                    }
                })
            );
    }

    updateRegistration(payload: UpdateRegistrationPayload) {
        return this._http.put<{ message: string; data: Registration }>(API_URL_MAP.UPDATE_REGISTRATION, payload).pipe(
            map(response => {
                const indexToUpdate: number = this._registrations.findIndex(r => r._id === payload.registrationId);
                if (indexToUpdate !== -1) {
                    this._registrations[indexToUpdate] = response.data;
                    this._registrationSubject.next(this._registrations.slice());
                }
                return response.message;
            })
        );
    }

    private calculateRamainingDaysToEvent(event: Event): number {
        const eventDate: Date = new Date(event.date);
        const today = new Date();

        // getTime() returns the number of milliseconds since January 1, 1970, 00:00:00 UTC.
        const timeDiffInMilliSeconds = eventDate.getTime() - today.getTime();
        // Convert milliseconds to days by dividing by the number of milliseconds in a day
        const dayInMilliSeconds = 1000 * 60 * 60 * 24;
        const differenceInDays = timeDiffInMilliSeconds / dayInMilliSeconds;

        return Math.floor(differenceInDays);
    }
}
