import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
    selector: 'app-staff-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './staff-layout.html',
    styleUrl: './staff-layout.css',
})
export class StaffLayout {
    private authService = inject(AuthService);
    private router = inject(Router);

    userName = this.authService.getUserName() || 'Staff';

    navLinks = [
        { label: 'Dashboard', path: '/staff/dashboard' },
        { label: 'Students', path: '/staff/students' },
        { label: 'Activities', path: '/staff/activities' },
        { label: 'Presence', path: '/staff/presence' },
        { label: 'Submissions', path: '/staff/submissions' },
        { label: 'Tasks', path: '/staff/tasks' },
    ];

    mobileMenuOpen = false;

    toggleMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }
    closeMenu(): void { this.mobileMenuOpen = false; }

    logout(): void {
        this.authService.clearStorage();
        this.router.navigate(['/login']);
    }
}
