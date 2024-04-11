import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Domain } from '../core/models/app.models';
import { NgFor, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DomainsService } from '../core/services/domains.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-domains',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatChipsModule,
        MatListModule,
        MatIconModule,
        ReactiveFormsModule
    ],
    templateUrl: './domains.component.html',
    styleUrl: './domains.component.css'
})
export default class DomainsComponent implements OnInit, OnDestroy {
    domains: Domain[] = [];
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    domainForm = new FormGroup({
        icon: new FormControl<string>('', { nonNullable: true }),
        name: new FormControl<string>('', { nonNullable: true }),
        description: new FormControl<string>('', { nonNullable: true }),
        interests: new FormControl<string[]>([], { nonNullable: true }),
        rank: new FormControl<number>(1, { nonNullable: true })
    });

    private _domainsService = inject(DomainsService);
    private _unsubscribeAll: Subject<null> = new Subject();

    ngOnInit(): void {
        this._domainsService.getDomains().subscribe();
        this._domainsService.domainsObs$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: response => {
                this.domains = response;
            }
        });
    }

    createDomain() {
        // this._domainsService
        //     .createDomain({
        //         icon: 'perm_media',
        //         name: 'Art',
        //         description: 'Art exhibitions, galleries, and cultural events showcasing visual arts.',
        //         interests: ['Painting', 'Sculpture', 'Photography', 'Film', 'Music', 'Design'],
        //         rank: 3
        //     })
        //     .subscribe({
        //         next: response => {
        //             console.log(response);
        //         }
        //     });
    }

    editDomain(domainId: string) {}

    deleteDomain(domainId: string) {}

    addInterest(interestId: any) {}

    removeInterest(interestId: string) {}

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
