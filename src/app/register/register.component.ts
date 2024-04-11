import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, switchMap, takeUntil, withLatestFrom } from 'rxjs';
import { EventsService } from '../core/services/events.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Domain, Event } from '../core/models/app.models';
import { DomainsService } from '../core/services/domains.service';

import { MatListModule, MatListOption } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [NgIf, NgFor, MatListModule, MatCardModule, DatePipe, MatButtonModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export default class RegisterComponent implements OnInit, OnDestroy {
    private _route = inject(ActivatedRoute);
    private _eventsService = inject(EventsService);
    private _domainsService = inject(DomainsService);

    event!: Event;
    domains: Domain[] = [];

    private _unsubscribeAll: Subject<null> = new Subject();
    ngOnInit(): void {
        this._route.paramMap
            .pipe(
                switchMap(paramMap => {
                    const eventId: string = paramMap.get('eventId') ?? '';
                    return this._eventsService.getEvent(eventId);
                }),
                withLatestFrom(this._domainsService.domainsObs$),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: ([event, domains]) => {
                    this.event = event;
                    this.domains = domains;
                }
            });
    }

    getDomainNameById(id: string): string {
        return this.domains.find(d => d._id === id)?.name ?? 'Unknown Domain';
    }

    getDomainInterestsById(id: string): string[] {
        return this.domains.find(d => d._id === id)?.interests ?? [];
    }

    registerForEvent(selectedOptions: MatListOption[]): void {
        const interests: string[] = [];
        selectedOptions.forEach(option => interests.push(option.value));
        console.log(interests);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
