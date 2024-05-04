import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { LoaderComponent } from './core/components/loader/loader.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, LoaderComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
    title = 'eventmate';

    private _authService = inject(AuthService);

    ngOnInit(): void {
        this._authService.autoSignIn();
    }
}
