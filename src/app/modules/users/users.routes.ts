import { Routes } from '@angular/router';
import UsersComponent from '../users/users.component';
import { usersResolver } from './users.resolver';

export default [
    {
        path: '',
        component: UsersComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./user-list/user-list.component'),
                resolve: { data: usersResolver }
            },
            {
                path: ':userId',
                loadComponent: () => import('./user-detail/user-detail.component')
            }
        ]
    }
] as Routes;
