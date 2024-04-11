import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Event } from '../core/models/app.models';
import { Subject } from 'rxjs';
import { EventsService } from '../core/services/events.service';

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [
        CommonModule,
        MatListModule,
        MatCardModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatIconModule
    ],
    templateUrl: './events.component.html',
    styleUrl: './events.component.css'
})
export default class EventsComponent implements OnInit, OnDestroy {
    events: Event[] = [];
    private _unsubscribeAll: Subject<null> = new Subject();
    private _eventsService = inject(EventsService);

    ngOnInit(): void {
        this._eventsService.getEvents().subscribe({
            next: response => {
                this.events = response;
            }
        });
    }

    userHasRegistered(v: any) {
        return true;
    }

    registerEvent() {}

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
