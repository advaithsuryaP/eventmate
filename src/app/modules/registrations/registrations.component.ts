import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { EventService } from '../events/event.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { Registration } from '../../core/app.models';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { UserService } from '../users/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomainService } from '../domains/domain.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../core/app.constants';

@Component({
    selector: 'app-registrations',
    standalone: true,
    imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, DatePipe],
    templateUrl: './registrations.component.html'
})
export default class RegistrationsComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['#', 'updatedAt', 'eventTitle', 'domain', 'username', 'interests', 'actions'];

    private _snackbar = inject(MatSnackBar);
    private _matDialog = inject(MatDialog);
    private _userService = inject(UserService);
    private _eventsService = inject(EventService);
    private _domainService = inject(DomainService);

    registrationFilterControl = new FormControl();

    dataSource!: MatTableDataSource<Registration>;
    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        this._eventsService.registrations$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: response => {
                this.dataSource = new MatTableDataSource(response);
            }
        });
    }

    getUsername(userId: string): string {
        return this._userService.getUserById(userId).username;
    }

    getEventTitle(eventId: string): string {
        return this._eventsService.getEventById(eventId).title;
    }

    getDomainName(domainId: string): string {
        return this._domainService.getDomainById(domainId).name;
    }

    deteleRegistration(registrationId: string) {
        this._matDialog
            .open(ConfirmDialogComponent, {
                disableClose: true,
                panelClass: 'confirm-dialog'
            })
            .afterClosed()
            .pipe(
                switchMap(result => {
                    if (result) return this._eventsService.unRegisterEvent(registrationId);
                    return EMPTY;
                })
            )
            .subscribe({
                next: response => {
                    if (response) this._snackbar.open('Registration cancelled successfully', SNACKBAR_ACTION.SUCCESS);
                    else this._snackbar.open('Error while cancelling registration', SNACKBAR_ACTION.ERROR);
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
