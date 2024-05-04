import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    private _isLoadingSubject = new BehaviorSubject<boolean>(false);
    isLoading$ = this._isLoadingSubject.asObservable();

    show(): void {
        this._isLoadingSubject.next(true);
    }

    hide(): void {
        this._isLoadingSubject.next(false);
    }
}
