import { Injectable, inject } from '@angular/core';
import { API_URL_MAP } from '../../core/app.constants';
import { Event, Registration } from '../../core/app.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { SaveEventPayload, RegisterEventPayload, UpdateRegistrationPayload } from '../../core/app.payload';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private _events: Event[] = [];
    private _eventsSubject = new BehaviorSubject<Event[]>([]);
    events$ = this._eventsSubject.asObservable();

    private _registrations: Registration[] = [];
    private _registrationSubject = new BehaviorSubject<Registration[]>([]);
    registrations$ = this._registrationSubject.asObservable();

    private _http = inject(HttpClient);

    getEvents(): Observable<Event[]> {
        return this._http.get<{ message: string; data: Event[] }>(API_URL_MAP.EVENTS).pipe(
            map(response => {
                const transformedEvents: Event[] = response.data.map(e => this._transformEvent(e));
                this._events = transformedEvents;
                this._eventsSubject.next(this._events.slice());
                return response.data;
            })
        );
    }

    getEvent(eventId: string): Observable<Event> {
        return this._http
            .get<{ message: string; data: Event }>(`${API_URL_MAP.EVENTS}/${eventId}`)
            .pipe(map(response => this._transformEvent(response.data)));
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

    unRegisterEvent(registrationId: string): Observable<boolean> {
        return this._http
            .delete<{ message: string; data: { acknowledged: boolean; deletedCount: number } }>(
                `${API_URL_MAP.REGISTRATIONS}/${registrationId}`
            )
            .pipe(
                map(response => {
                    if (response.data.deletedCount === 1) {
                        const indexToDelete = this._registrations.findIndex(r => r._id === registrationId);
                        if (indexToDelete !== -1) {
                            this._registrations.splice(indexToDelete, 1);
                            this._registrationSubject.next(this._registrations.slice());
                        }
                        return true;
                    }
                    return false;
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

    getEventById(eventId: string): Event {
        const event = this._events.find(e => e._id === eventId);
        if (!event) throw new Error('Event not found');
        return event;
    }

    private _transformEvent(event: Event): Event {
        const daysLeftForEventToStart: number = this._calculateRamainingDaysToEvent(event.startDate);
        return {
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            eventStartsIn: daysLeftForEventToStart,
            registrationClosesIn: daysLeftForEventToStart - 1,
            isRegistrationClosed: daysLeftForEventToStart <= 1
        };
    }

    private _calculateRamainingDaysToEvent(startDate: Date): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to midnight for accurate day calculation
        const eventStartDate: Date = new Date(startDate);

        // Calculate difference in milliseconds
        const timeDifference = eventStartDate.getTime() - today.getTime();

        // Convert milliseconds to days
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        return daysDifference;
    }
}
