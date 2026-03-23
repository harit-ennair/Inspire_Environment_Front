import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './activities-list.html',
  styleUrls: ['./activities-list.css'],
})
export class ActivitiesList implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private departmentsService = inject(DepartmentsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  Math = Math;

  activities = signal<Activity[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');
  deleteConfirmId = signal<number | null>(null);
  departments = signal<any[]>([]);
  selectedDepartmentId = signal<number | null>(null);

  currentPage = signal<number>(0);
  pageSize = signal<number>(9);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  ngOnInit(): void {
    this.loadDepartments();
    this.loadActivities();
  }

  loadDepartments(): void {
    this.departmentsService.getAllDepartments().subscribe({
      next: (data: any[]) => this.departments.set(data),
      error: () => {}
    });
  }

  loadActivities(): void {
    this.loading.set(true);
    this.activitiesService.searchActivities(this.searchTerm(), this.currentPage(), this.pageSize()).subscribe({
      next: (page: any) => {
        this.activities.set(page.content || []);
        this.totalElements.set(page.totalElements || 0);
        this.totalPages.set(page.totalPages || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load activities.');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadActivities();
  }

  onDepartmentFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const id = value ? +value : null;
    this.selectedDepartmentId.set(id);
    this.searchTerm.set('');
    this.currentPage.set(0);
    if (!id) { this.loadActivities(); return; }
    this.loading.set(true);
    this.activitiesService.getActivitiesByDepartment(id).subscribe({
      next: (data: Activity[]) => {
        this.activities.set(data);
        this.totalPages.set(1);
        this.totalElements.set(data.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to filter by department.');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadActivities();
    }
  }

  nextPage(): void { this.goToPage(this.currentPage() + 1); }
  previousPage(): void { this.goToPage(this.currentPage() - 1); }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  confirmDelete(id: number): void { this.deleteConfirmId.set(id); }
  cancelDelete(): void { this.deleteConfirmId.set(null); }

  deleteActivity(id: number): void {
    this.activitiesService.deleteActivity(id).subscribe({
      next: () => { this.deleteConfirmId.set(null); this.loadActivities(); },
      error: () => { this.error.set('Failed to delete activity.'); this.deleteConfirmId.set(null); }
    });
  }

  viewDetails(id: number): void { this.router.navigate([id], { relativeTo: this.route }); }
  editActivity(id: number): void { this.router.navigate([id, 'edit'], { relativeTo: this.route }); }
}
