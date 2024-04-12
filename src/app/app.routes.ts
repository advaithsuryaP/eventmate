import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot, Routes } from '@angular/router';
import { Domain } from './core/models/app.models';
import { inject } from '@angular/core';
import { DomainsService } from './core/services/domains.service';
import { authGuard } from './core/services/auth.guard';

export const domainResolver: ResolveFn<Domain[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(DomainsService).getDomains();
};

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./events/events.component'),
        resolve: { domains: domainResolver }
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes')
    },
    {
        path: 'domains',
        loadComponent: () => import('./domains/domains.component'),
        canActivate: [authGuard]
    },
    {
        path: 'register/:eventId',
        loadComponent: () => import('./register/register.component'),
        canActivate: [authGuard]
    }
];
