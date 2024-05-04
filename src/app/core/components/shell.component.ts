import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent],
    template: `
        <app-header />
        <router-outlet />
    `
})
export class ShellComponent {}
