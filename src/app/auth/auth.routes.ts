import { Routes } from '@angular/router';
import AuthComponent from './auth.component';

export default [
    {
        path: '',
        component: AuthComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./sign-in/sign-in.component')
            },
            {
                path: 'register',
                loadComponent: () => import('./register/register.component')
            }
        ]
    }
] as Routes;
