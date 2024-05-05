import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { DomainService } from '../../modules/domains/domain.service';
import { Domain, Event, Registration } from '../app.models';
import { combineLatest, tap } from 'rxjs';
import { EventService } from '../../modules/events/event.service';
import { LoaderService } from './loader.service';

export const appResolver: ResolveFn<[Event[], Domain[], Registration[]]> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const loaderService = inject(LoaderService);
    loaderService.show();
    return combineLatest([
        inject(EventService).getEvents(),
        inject(DomainService).getDomains(),
        inject(EventService).fetchRegistrations()
    ]).pipe(tap(() => loaderService.hide()));
};
