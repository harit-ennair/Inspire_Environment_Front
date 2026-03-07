import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-page-error403',
    imports: [],
    templateUrl: './page-error403.html',
    styleUrl: './page-error403.css',
})
export class PageError403 {
    constructor(private router: Router) { }

    goHome(): void {
        this.router.navigate(['/login']);
    }
}
