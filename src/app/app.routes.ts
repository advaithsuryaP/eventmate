import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';
import { appResolver } from './core/services/app.resolver';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./events/events.component'),
        resolve: { data: appResolver }
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes')
    },
    {
        path: 'domains',
        loadComponent: () => import('./domains/domains.component'),
        resolve: { data: appResolver },
        canActivate: [authGuard]
    },
    {
        path: 'register/:eventId',
        loadComponent: () => import('./registration/registration.component'),
        resolve: { data: appResolver },
        canActivate: [authGuard]
    }
];
