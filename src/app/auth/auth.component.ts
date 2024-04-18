import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    imports: [RouterOutlet, MatCardModule],
    templateUrl: './auth.component.html'
})
export default class AuthComponent {}
