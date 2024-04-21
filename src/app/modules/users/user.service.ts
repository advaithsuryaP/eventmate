import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL_MAP } from '../../core/app.constants';
import { Registration } from '../../core/app.models';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _http = inject(HttpClient);
}
