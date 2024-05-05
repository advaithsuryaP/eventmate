import { ResolveFn } from '@angular/router';
import { UserService } from './user.service';
import { inject } from '@angular/core';
import { LoaderService } from '../../core/services/loader.service';
import { tap } from 'rxjs';
import { User } from '../../core/app.models';

export const usersResolver: ResolveFn<User[]> = (route, state) => {
    const loaderService = inject(LoaderService);
    loaderService.show();
    return inject(UserService)
        .fetchUsers()
        .pipe(tap(() => loaderService.hide()));
};
