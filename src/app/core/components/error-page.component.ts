import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-error-page',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, RouterLink],
    template: `
        <div class="container p-4">
            <div class="text-center p-4">
                <div class="d-flex flex-column p-4">
                    <div class="d-flex justify-content-center">
                        <img
                            src="../../../../assets/images/server-down.svg"
                            class="img-thumbnail"
                            height="600"
                            width="600" />
                    </div>

                    <div class="mat-headline-2 mt-4">Server down...</div>

                    <div class="d-flex justify-content-center">
                        <div class="alert alert-warning" role="alert">
                            <div class="mat-headline-5">
                                This could happen due to backend instance being automatically turned off due to security
                                reasons.
                            </div>
                            <div class="mat-headline-6">Please contact the administrators and we'll get it fixed.</div>
                            <div class="mat-subtitle-2">Advaith: {{ 'spandra1@umbc.edu' }}</div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-center">
                        <button
                            mat-raised-button
                            [routerLink]="['/events']"
                            color="primary"
                            class="d-flex align-items-center">
                            <mat-icon>refresh</mat-icon>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export default class ErrorPageComponent {}
