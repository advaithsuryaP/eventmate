import { Routes } from '@angular/router';
import EventsComponent from './events.component';

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
                loadComponent: () => import('./event-edit/event-edit.component')
            },
            {
                path: 'edit/:eventId',
                loadComponent: () => import('./event-edit/event-edit.component')
            }
        ]
    }
] as Routes;
