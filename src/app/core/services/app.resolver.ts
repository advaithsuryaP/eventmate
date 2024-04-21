import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { DomainService } from '../../modules/domains/domain.service';
import { Domain, Event, Registration } from '../app.models';
import { combineLatest } from 'rxjs';
import { EventService } from '../../modules/events/event.service';
import { RegistrationService } from '../../modules/registration/registration.service';

export const appResolver: ResolveFn<[Event[], Domain[], Registration[]]> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    return combineLatest([
        inject(EventService).getEvents(),
        inject(DomainService).getDomains(),
        inject(RegistrationService).getRegistrations()
    ]);
};
