import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { DomainService } from '../../modules/domains/domain.service';
import { Domain, Event } from '../app.models';
import { combineLatest } from 'rxjs';
import { EventService } from '../../modules/events/event.service';

export const appResolver: ResolveFn<[Domain[], Event[]]> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    return combineLatest([inject(DomainService).getDomains(), inject(EventService).getEvents()]);
};
