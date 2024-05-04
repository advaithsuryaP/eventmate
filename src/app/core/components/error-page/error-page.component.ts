import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-error-page',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, RouterLink],
    templateUrl: './error-page.component.html'
})
export default class ErrorPageComponent {}
