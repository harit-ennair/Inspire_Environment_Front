import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class NavbarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    userName = this.authService.getUserName() || 'User';
    userRole = this.authService.getRole()?.toLowerCase() || 'student';

    adminNavLinks = [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Roles', path: '/admin/roles' },
        { label: 'Departments', path: '/admin/departments' },
        { label: 'Staff', path: '/admin/staff' },
        { label: 'Students', path: '/admin/students' },
        { label: 'Activities', path: '/admin/activities' },
        { label: 'Presence', path: '/admin/presence' },
    ];

    staffNavLinks = [
        { label: 'Dashboard', path: '/staff/dashboard' },
        { label: 'Students', path: '/staff/students' },
        { label: 'Activities', path: '/staff/activities' },
        { label: 'Presence', path: '/staff/presence' },
    ];

    studentNavLinks = [
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'Activities', path: '/student/activities' },
        { label: 'Presence', path: '/student/presence' },
    ];

    mobileMenuOpen = false;

    // Dynamic navigation links based on role
    get navLinks() {
        const role = this.userRole;
        if (role === 'admin') return this.adminNavLinks;
        if (role === 'staff') return this.staffNavLinks;
        return this.studentNavLinks;
    }

    // Dynamic dashboard path based on role
    get dashboardPath() {
        const role = this.userRole;
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'staff') return '/staff/dashboard';
        return '/student/dashboard';
    }

    // Display role name with proper capitalization
    get roleDisplay() {
        return this.userRole.charAt(0).toUpperCase() + this.userRole.slice(1);
    }

    toggleMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }
    closeMenu(): void { this.mobileMenuOpen = false; }

    logout(): void {
        this.authService.logout().subscribe({
            next: () => {
                this.authService.clearStorage();
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error('Logout failed:', err);
            }});
    }
}
