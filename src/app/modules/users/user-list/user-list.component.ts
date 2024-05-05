import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Registration, User } from '../../../core/app.models';
import { EMPTY, Subject, combineLatest, debounceTime, map, startWith, switchMap, takeUntil } from 'rxjs';
import { UserService } from '../user.service';
import { EventService } from '../../events/event.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../../core/app.constants';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    standalone: true,
    imports: [
        DecimalPipe,
        UpperCasePipe,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatButtonModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatPaginatorModule,
        ReactiveFormsModule
    ],
    templateUrl: './user-list.component.html',
    styles: [
        `
            .even-stripes {
                background-color: rgba(0, 0, 0, 0.05);
            }

            .odd-stripes {
                background-color: white;
            }
        `
    ]
})
export default class UserListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    users: User[] = [];
    registrations: Registration[] = [];

    displayedColumns: string[] = ['#', 'username', 'email', 'registrationCount', 'registrationReport', 'configure'];

    searchFilterControl = new FormControl<string>('');

    dataSource!: MatTableDataSource<User>;
    private _unsubscribeAll: Subject<null> = new Subject();

    private _snackbar = inject(MatSnackBar);
    private _matDialog = inject(MatDialog);
    private _userService = inject(UserService);
    private _eventsService = inject(EventService);

    ngOnInit(): void {
        combineLatest([this._userService.users$, this._eventsService.registrations$])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ([users, registrations]) => {
                    this.dataSource = new MatTableDataSource(users);

                    // Reset pagination status for further updates on users table
                    const searchTerm: string = this.searchFilterControl.value!;
                    this.dataSource.filter = searchTerm.trim().toLowerCase();
                    this.dataSource.paginator = this.paginator;

                    this.registrations = registrations;
                }
            });

        this.searchFilterControl.valueChanges
            .pipe(
                startWith(''),
                map(result => (result ? result : '')),
                debounceTime(1000),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: response => {
                    this.dataSource.filter = response.trim().toLowerCase();
                    if (this.paginator) {
                        this.dataSource.paginator?.firstPage();
                    }
                }
            });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getTotalUserRegistrations(userId: string): number {
        return this.registrations.filter(r => r.userId === userId).length;
    }

    toggleFlagStatus(userId: string): void {
        this._matDialog
            .open(ConfirmDialogComponent, {
                disableClose: true,
                panelClass: 'confirm-dialog'
            })
            .afterClosed()
            .pipe(
                switchMap(result => {
                    if (result) return this._userService.flagUser(userId);
                    return EMPTY;
                })
            )
            .subscribe({
                next: response => {
                    if (response) this._snackbar.open('User flagged successfully', SNACKBAR_ACTION.SUCCESS);
                    else this._snackbar.open('Error while flagging user', SNACKBAR_ACTION.ERROR);
                }
            });
    }

    resetSearch(): void {
        this.searchFilterControl.setValue('');
    }

    editUser(): void {}

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
