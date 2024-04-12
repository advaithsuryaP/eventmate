import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { DomainService } from '../../domains/domain.service';
import { Domain } from '../app.models';

export const appResolver: ResolveFn<Domain[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(DomainService).getDomains();
};
