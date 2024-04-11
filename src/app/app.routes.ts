import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', loadComponent: () => import('./events/events.component') },
    { path: 'domains', loadComponent: () => import('./domains/domains.component') }
];
