import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [AsyncPipe],
    template: `
        @if (isLoading$ | async) {
        <div class="d-flex justify-content-center align-items-center h-100 w-100 overlay">
            <img [src]="appLoaderSrc" alt="loader" />
        </div>
        }
    `,
    styles: [
        `
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                background-color: transparent;
            }
        `
    ]
})
export class LoaderComponent {
    private _loaderService = inject(LoaderService);
    isLoading$ = this._loaderService.isLoading$;
    appLoaderSrc: string = 'assets/images/app-loader.gif';
}
