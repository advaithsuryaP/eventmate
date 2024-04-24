import { Routes } from '@angular/router';
import EventsComponent from './events.component';
import { authGuard } from '../../core/services/auth.guard';

export default [
    {
        path: '',
        component: EventsComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./event-list/event-list.component')
            },
            {
                path: 'create-event',
                canActivate: [authGuard],
                loadComponent: () => import('./event-edit/event-edit.component')
            },
            {
                path: 'edit/:eventId',
                canActivate: [authGuard],
                loadComponent: () => import('./event-edit/event-edit.component')
            },
            {
                path: ':eventId',
                canActivate: [authGuard],
                loadComponent: () => import('./event-detail/event-detail.component')
            }
        ]
    }
] as Routes;
