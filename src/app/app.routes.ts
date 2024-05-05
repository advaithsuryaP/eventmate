import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';
import { appResolver } from './core/services/app.resolver';
import { ShellComponent } from './core/components/shell.component';
import { usersResolver } from './modules/users/users.resolver';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes')
    },
    {
        path: '',
        component: ShellComponent,
        resolve: { data: appResolver },
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadChildren: () => import('./modules/events/events.routes')
            },
            {
                path: 'events',
                loadChildren: () => import('./modules/events/events.routes')
            },
            {
                path: 'registrations',
                loadComponent: () => import('./modules/registrations/registrations.component'),
                resolve: { data: usersResolver },
                canActivate: [authGuard]
            },
            {
                path: 'domains',
                loadComponent: () => import('./modules/domains/domains.component'),
                canActivate: [authGuard]
            },
            {
                path: 'users',
                loadChildren: () => import('./modules/users/users.routes'),
                canActivate: [authGuard]
            }
        ]
    },
    {
        path: '**',
        loadComponent: () => import('./core/components/error-page.component')
    }
];
