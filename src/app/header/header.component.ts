import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { CurrentUser } from '../core/app.models';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [MatMenuModule, MatListModule, MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
    private _authService = inject(AuthService);
    currentUser!: CurrentUser | null;

    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        this._authService.currentUserObs$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: currentUser => {
                this.currentUser = currentUser;
            }
        });
    }

    onSignout(): void {}

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
