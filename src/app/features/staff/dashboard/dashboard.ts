import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StudentsService } from '../../../core/services/api/students.service';
import { StaffService } from '../../../core/services/api/staff.service';
import { ActivitiesService } from '../../../core/services/api/activities.service';
import { DepartmentsService } from '../../../core/services/api/departments.service';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {

  private studentsService = inject(StudentsService);
  private staffService = inject(StaffService);
  private activitiesService = inject(ActivitiesService);
  private departmentsService = inject(DepartmentsService);
  private authService = inject(AuthService);

  private router = inject(Router);

  totalStudents = signal<number>(0);
  totalStaff = signal<number>(0);
  totalActivities = signal<number>(0);
  totalDepartments = signal<number>(0);

  userName = this.authService.getUserName() || 'Staff Member';
  

  recentActivities = signal<any[]>([]);
  loading = signal<boolean>(true);
  today = new Date();

  navItems = [
    { label: 'Students',    icon: '🎓', route: '/staff/students',    color: 'card-blue' },
    { label: 'Staff',       icon: '👨‍🏫', route: '/admin/staff',       color: 'card-green' },
    { label: 'Departments', icon: '🏢', route: '/admin/departments',  color: 'card-purple' },
    { label: 'Activities',  icon: '📋', route: '/staff/activities',   color: 'card-orange' },
    { label: 'Roles',       icon: '🔑', route: '/admin/roles',        color: 'card-red' },
    { label: 'Presence',    icon: '📍', route: '/staff/presence',     color: 'card-indigo' },
  ];

  ngOnInit(): void {
    this.loadStats();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  loadStats(): void {
    this.studentsService.getAllStudents().subscribe({
      next: (data) => this.totalStudents.set(data.length),
      error: () => this.totalStudents.set(0),
    });

    this.staffService.getAllStaffs().subscribe({
      next: (data) => this.totalStaff.set(data.length),
      error: () => this.totalStaff.set(0),
    });

    this.departmentsService.getAllDepartments().subscribe({
      next: (data) => this.totalDepartments.set(data.length),
      error: () => this.totalDepartments.set(0),
    });

    this.activitiesService.getAllActivities().subscribe({
      next: (data) => {
        this.totalActivities.set(data.length);
        this.recentActivities.set(data.slice(0, 5));
        this.loading.set(false);
      },
      error: () => {
        this.totalActivities.set(0);
        this.loading.set(false);
      },
    });
  }
}
