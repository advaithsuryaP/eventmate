import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot, Routes } from '@angular/router';
import { Domain } from './core/models/app.models';
import { inject } from '@angular/core';
import { authGuard } from './core/services/auth.guard';
import { DomainService } from './domains/domain.service';

export const domainResolver: ResolveFn<Domain[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(DomainService).getDomains();
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
        loadComponent: () => import('./registration/registration.component'),
        canActivate: [authGuard]
    }
];
