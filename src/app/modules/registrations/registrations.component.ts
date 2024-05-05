import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { EMPTY, Subject, debounceTime, map, startWith, switchMap, takeUntil } from 'rxjs';
import { EventService } from '../events/event.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Domain } from '../../core/app.models';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { UserService } from '../users/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomainService } from '../domains/domain.service';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTION } from '../../core/app.constants';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

interface EventRegistrationData {
    _id: string;
    username: string;
    eventTitle: string;
    domainName: string;
    interests: string[];
    updatedAt: Date;
}

@Component({
    selector: 'app-registrations',
    standalone: true,
    imports: [
        DatePipe,
        UpperCasePipe,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatButtonModule,
        MatSelectModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatFormFieldModule,
        ReactiveFormsModule
    ],
    templateUrl: './registrations.component.html',
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
export default class RegistrationsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    domains: Domain[] = [];
    displayedColumns: string[] = ['#', 'updatedAt', 'username', 'eventTitle', 'domain', 'interests', 'configure'];

    private _snackbar = inject(MatSnackBar);
    private _matDialog = inject(MatDialog);
    private _userService = inject(UserService);
    private _eventsService = inject(EventService);
    private _domainService = inject(DomainService);

    searchFilterControl = new FormControl<string>('');

    dataSource!: MatTableDataSource<EventRegistrationData>;
    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        this._eventsService.registrations$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: response => {
                const eventRegistrations: EventRegistrationData[] = [];
                response.forEach(r => {
                    const eventRegistrationData: EventRegistrationData = {
                        _id: r._id,
                        updatedAt: new Date(r.updatedAt),
                        username: this.getUsername(r.userId),
                        eventTitle: this.getEventTitle(r.eventId),
                        domainName: this.getDomainName(r.domainId),
                        interests: r.interests
                    };
                    eventRegistrations.push(eventRegistrationData);
                });
                this.dataSource = new MatTableDataSource(eventRegistrations);

                // Reset pagination and filter status for further updates on registration table

                const searchTerm: string = this.searchFilterControl.value!;
                this.dataSource.filter = searchTerm.trim().toLowerCase();
                this.dataSource.paginator = this.paginator;
            }
        });
        this._domainService.domains$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: response => (this.domains = response)
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

    getUsername(userId: string): string {
        return this._userService.getUserById(userId).username;
    }

    getEventTitle(eventId: string): string {
        return this._eventsService.getEventById(eventId).title;
    }

    getDomainName(domainId: string): string {
        return this._domainService.getDomainById(domainId).name;
    }

    resetSearch(): void {
        this.searchFilterControl.setValue('');
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
