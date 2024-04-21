import { Routes } from '@angular/router';
import UsersComponent from '../users/users.component';

export default [
    {
        path: '',
        component: UsersComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./user-list/user-list.component')
            },
            {
                path: ':userId',
                loadComponent: () => import('./user-detail/user-detail.component')
            }
        ]
    }
] as Routes;
