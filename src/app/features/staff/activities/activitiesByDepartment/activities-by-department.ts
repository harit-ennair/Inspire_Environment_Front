import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-activities-by-department',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activities-by-department.html',
  styleUrls: ['./activities-by-department.css'],
})
export class ActivitiesByDepartment implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private departmentsService = inject(DepartmentsService);
  private router = inject(Router);

  departments = signal<any[]>([]);
  activities = signal<Activity[]>([]);
  weekActivities = signal<Activity[]>([]);
  selectedDeptId = signal<number | null>(null);
  loading = signal<boolean>(false);
  loadingWeek = signal<boolean>(false);
  error = signal<string | null>(null);
  showWeekOnly = signal<boolean>(false);

  ngOnInit(): void {
    this.departmentsService.getAllDepartments().subscribe({
      next: (data: any[]) => this.departments.set(data),
      error: () => {}
    });
  }

  onDepartmentChange(id: number): void {
    this.selectedDeptId.set(Number(id));
    this.loadActivities(Number(id));
  }

  loadActivities(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.getActivitiesByDepartment(id).subscribe({
      next: (data: Activity[]) => {
        this.activities.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load activities.');
        this.loading.set(false);
      }
    });

    this.loadingWeek.set(true);
    this.activitiesService.getActivitiesThisWeekByDepartment(id).subscribe({
      next: (data: Activity[]) => {
        this.weekActivities.set(data);
        this.loadingWeek.set(false);
      },
      error: () => { this.loadingWeek.set(false); }
    });
  }

  displayedActivities(): Activity[] {
    return this.showWeekOnly() ? this.weekActivities() : this.activities();
  }

  viewActivity(id: number): void {
    this.router.navigate(['/admin/activities', id]);
  }
}
