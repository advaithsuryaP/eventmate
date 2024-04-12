import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { API_URL_MAP } from '../core/constants/app.constants';
import { Domain } from '../core/models/app.models';
import { CreateDomainPayload } from '../core/models/app.payload';

@Injectable({
    providedIn: 'root'
})
export class DomainService {
    private _domainsSubject = new BehaviorSubject<Domain[]>([]);
    domainsObs$ = this._domainsSubject.asObservable();

    private _http = inject(HttpClient);

    getDomains(): Observable<Domain[]> {
        return this._http.get<{ message: string; data: Domain[] }>(API_URL_MAP.DOMAINS).pipe(
            map(response => response.data),
            tap(response => this._domainsSubject.next(response))
        );
    }

    createDomain(payload: CreateDomainPayload) {
        return this._http.post<{ message: string; data: Domain }>(API_URL_MAP.DOMAINS, payload);
    }
}
