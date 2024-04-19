import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { API_URL_MAP } from '../../core/app.constants';
import { Domain } from '../../core/app.models';
import { CreateDomainPayload } from '../../core/app.payload';

@Injectable({
    providedIn: 'root'
})
export class DomainService {
    private _domains: Domain[] = [];
    private _domainsSubject = new BehaviorSubject<Domain[]>(this._domains);
    domainsObs$ = this._domainsSubject.asObservable();

    private _http = inject(HttpClient);

    getDomains(): Observable<Domain[]> {
        return this._http.get<{ message: string; data: Domain[] }>(API_URL_MAP.DOMAINS).pipe(
            map(response => {
                this._domains = response.data;
                this._domainsSubject.next(this._domains.slice());
                return response.data;
            })
        );
    }

    createDomain(payload: CreateDomainPayload): Observable<string> {
        return this._http.post<{ message: string; data: Domain }>(API_URL_MAP.DOMAINS, payload).pipe(
            map(response => {
                this._domains.push(response.data);
                this._domainsSubject.next(this._domains.slice());
                return response.message;
            })
        );
    }

    deleteDomain(domainId: string, index: number): Observable<boolean> {
        return this._http
            .delete<{ message: string; data: { acknowledged: boolean; deletedCount: number } }>(
                `${API_URL_MAP.DOMAINS}/${domainId}`
            )
            .pipe(
                map(response => {
                    if (response.data.deletedCount === 1) {
                        this._domains.splice(index, 1);
                        this._domainsSubject.next(this._domains.slice());
                        return true;
                    }
                    return false;
                })
            );
    }
}
