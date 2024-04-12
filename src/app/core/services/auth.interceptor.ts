import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authToken = inject(AuthService).getToken();

    // Clone the request and add the authorization header
    const authRequest = req.clone({
        setHeaders: {
            Authorization: `Bearer ${authToken}`
        }
    });

    // Pass the cloned request with the updated header to the next handler
    return next(authRequest);
};
