import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './admin-layout.html',
    styleUrl: './admin-layout.css',
})
export class AdminLayout {
    private authService = inject(AuthService);
    private router = inject(Router);

    userName = this.authService.getUserName() || 'Admin';

    navLinks = [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Roles', path: '/admin/roles' },
        { label: 'Departments', path: '/admin/departments' },
        { label: 'Staff', path: '/admin/staff' },
        { label: 'Students', path: '/admin/students' },
        { label: 'Activities', path: '/admin/activities' },
        { label: 'Presence', path: '/admin/presence' },
        { label: 'Submissions', path: '/admin/submissions' },
        { label: 'Tasks', path: '/admin/tasks' },
    ];

    mobileMenuOpen = false;

    toggleMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }
    closeMenu(): void { this.mobileMenuOpen = false; }

    logout(): void {
        this.authService.clearStorage();
        this.router.navigate(['/login']);
    }
}
