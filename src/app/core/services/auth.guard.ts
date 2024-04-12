import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../app.constants';

export const authGuard: CanActivateFn = (route, state) => {
    const isLoggedIn = inject(AuthService).getToken();
    if (!isLoggedIn) {
        inject(MatSnackBar).open('Please login to access this route!', SNACKBAR_ACTION.WARNING);
        return inject(Router).navigate(['/auth']);
    }
    return true;
};
