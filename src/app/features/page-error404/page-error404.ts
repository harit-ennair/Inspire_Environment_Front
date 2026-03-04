import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-error404',
  imports: [],
  templateUrl: './page-error404.html',
  styleUrl: './page-error404.css',
})
export class PageError404 {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/login']);
  }
}
