import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activities-list.html',
  styleUrls: ['./activities-list.css'],
})
export class ActivitiesList implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private departmentsService = inject(DepartmentsService);
  private router = inject(Router);

  activities = signal<Activity[]>([]);
  allActivities = signal<Activity[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');
  deleteConfirmId = signal<number | null>(null);
  departments = signal<any[]>([]);
  selectedDepartmentId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadActivities();
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentsService.getAllDepartments().subscribe({
      next: (data: any[]) => this.departments.set(data),
      error: () => {}
    });
  }

  onDepartmentFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const id = value ? +value : null;
    this.selectedDepartmentId.set(id);
    this.searchTerm.set('');
    if (!id) {
      this.loadActivities();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.getActivitiesByDepartment(id).subscribe({
      next: (data: Activity[]) => {
        const sorted = data.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));
        this.allActivities.set(sorted);
        this.activities.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to filter by department.');
        this.loading.set(false);
      }
    });
  }

  loadActivities(): void {
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.getAllActivities().subscribe({
      next: (data: Activity[]) => {
        const sorted = data.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));
        this.allActivities.set(sorted);
        this.activities.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load activities.');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      this.activities.set(this.allActivities());
      return;
    }
    const filtered = this.allActivities().filter(a =>
      a.title?.toLowerCase().includes(term)
    );
    this.activities.set(filtered);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.activities.set(this.allActivities());
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  deleteActivity(id: number): void {
    this.activitiesService.deleteActivity(id).subscribe({
      next: () => {
        this.activities.update(list => list.filter(a => a.id !== id));
        this.deleteConfirmId.set(null);
      },
      error: () => {
        this.error.set('Failed to delete activity.');
        this.deleteConfirmId.set(null);
      }
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/admin/activities', id]);
  }

  editActivity(id: number): void {
    this.router.navigate(['/admin/activities', id, 'edit']);
  }
}
