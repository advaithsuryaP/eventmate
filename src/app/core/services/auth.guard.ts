import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (route, state) => {
    const isLoggedIn = inject(AuthService).getToken();
    if (!isLoggedIn) {
        inject(MatSnackBar).open('Please login to access this route!', 'Warning', { duration: 3000 });
        return inject(Router).navigate(['/auth']);
    }
    return true;
};