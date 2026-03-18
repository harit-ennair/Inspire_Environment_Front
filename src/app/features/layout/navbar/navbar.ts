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
        { label: 'Dashboard', path: '/dashboard', exact: true },
        { label: 'Profile', path: '/dashboard/profile', exact: false },
        { label: 'Roles', path: '/admin/roles', exact: false },
        { label: 'Departments', path: '/admin/departments', exact: false },
        { label: 'Staff', path: '/admin/staff', exact: false },
        { label: 'Students', path: '/admin/students', exact: false },
        { label: 'Activities', path: '/admin/activities', exact: false },
        { label: 'Presence', path: '/admin/presence', exact: false },
    ];

    staffNavLinks = [
        { label: 'Dashboard', path: '/dashboard', exact: true },
        { label: 'Profile', path: '/dashboard/profile', exact: false },
        { label: 'Students', path: '/staff/students', exact: false },
        { label: 'Activities', path: '/staff/activities', exact: false },
        { label: 'Presence', path: '/staff/presence', exact: false },
    ];

    studentNavLinks = [
        { label: 'Dashboard', path: '/student/dashboard', exact: true },
        { label: 'Profile', path: '/student/profile', exact: false },
        { label: 'Activities', path: '/student/activities', exact: false },
        { label: 'Presence', path: '/student/presence', exact: false },
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
        if (role === 'admin' || role === 'staff') return '/dashboard';
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
