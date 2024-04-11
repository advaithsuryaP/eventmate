import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Domain } from '../models/app.models';
import { API_URL_MAP } from '../constants/app.constants';

@Injectable({
    providedIn: 'root'
})
export class DomainsService {
    private _domainsSubject = new BehaviorSubject<Domain[]>([]);
    domainsObs$ = this._domainsSubject.asObservable();

    private _http = inject(HttpClient);

    getDomains(): Observable<Domain[]> {
        return this._http
            .get<{ message: string; data: Domain[] }>(API_URL_MAP.GET_DOMAINS)
            .pipe(map(response => response.data));
    }
}
