import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/api/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-student-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './student-layout.html',
    styleUrl: './student-layout.css',
})
export class StudentLayout {
    private authService = inject(AuthService);
    private router = inject(Router);

    userName = this.authService.getUserName() || 'Student';

    navLinks = [
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'Activities', path: '/student/activities' },
        { label: 'Presence', path: '/student/presence' },
        { label: 'Tasks', path: '/student/tasks' },
        { label: 'Submissions', path: '/student/submissions' },
    ];

    mobileMenuOpen = false;

    toggleMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    closeMenu(): void {
        this.mobileMenuOpen = false;
    }

    logout(): void {
        this.authService.clearStorage();
        this.router.navigate(['/login']);
    }
}
