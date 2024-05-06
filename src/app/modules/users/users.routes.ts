import { Routes } from '@angular/router';
import UsersComponent from '../users/users.component';
import { usersResolver } from './users.resolver';

export default [
    {
        path: '',
        component: UsersComponent,
        resolve: { data: usersResolver },
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
