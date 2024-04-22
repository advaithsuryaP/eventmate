import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    imports: [RouterOutlet, MatCardModule],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.css'
})
export default class AuthComponent {}
