import { Routes } from '@angular/router';
import AuthComponent from './auth.component';

export default [
    {
        path: '',
        component: AuthComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'sign-in'
            },
            {
                path: 'sign-in',
                loadComponent: () => import('./sign-in/sign-in.component')
            },
            {
                path: 'sign-up',
                loadComponent: () => import('./sign-up/sign-up.component')
            }
        ]
    }
] as Routes;
