import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackbarService = inject(MatSnackBar);
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unknown error occured!';
            if (error.status === 0) {
                errorMessage = 'Backend unavailable. Please try again later.';
            } else if (error.error.message) {
                errorMessage = error.error.message;
            }
            snackbarService.open(errorMessage, 'ERROR');
            return throwError(() => error);
        })
    );
};
