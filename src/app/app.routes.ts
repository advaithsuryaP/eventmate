import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot, Routes } from '@angular/router';
import { Domain } from './core/models/app.models';
import { inject } from '@angular/core';
import { DomainsService } from './core/services/domains.service';

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
        path: 'domains',
        loadComponent: () => import('./domains/domains.component'),
        resolve: { domains: domainResolver }
    },
    {
        path: 'register/:eventId',
        loadComponent: () => import('./register/register.component'),
        resolve: { domains: domainResolver }
    }
];
