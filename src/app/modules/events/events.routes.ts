import { Routes } from '@angular/router';
import EventsComponent from './events.component';

export default [
    {
        path: '',
        component: EventsComponent
        // children: [
        //     {
        //         path: '',
        //         loadComponent: () => import('./sign-in/sign-in.component')
        //     },
        //     {
        //         path: 'sign-up',
        //         loadComponent: () => import('./sign-up/sign-up.component')
        //     }
        // ]
    }
] as Routes;