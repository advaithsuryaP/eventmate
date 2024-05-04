import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { ERROR_CODE_MAP, SNACKBAR_ACTION } from '../app.constants';
import { Router } from '@angular/router';
import { LoaderService } from './loader.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const loaderService = inject(LoaderService);
    const snackbarService = inject(MatSnackBar);
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unknown error occured!';
            if (error.status === 0) {
                router.navigate(['/error'], { queryParams: { reason: ERROR_CODE_MAP.backendUnavailable } });
                errorMessage = 'Backend unavailable. Please try again later.';
            } else if (error.error.message) {
                errorMessage = error.error.message;
            }
            loaderService.hide();
            snackbarService.open(errorMessage, SNACKBAR_ACTION.ERROR);
            return throwError(() => error);
        })
    );
};
