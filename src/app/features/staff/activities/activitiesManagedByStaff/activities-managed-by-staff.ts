import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { StaffService } from '../../../../core/services/api/staff.service';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-activities-managed-by-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activities-managed-by-staff.html',
  styleUrls: ['./activities-managed-by-staff.css'],
})
export class ActivitiesManagedByStaff implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private staffService = inject(StaffService);
  private router = inject(Router);

  staffList = signal<any[]>([]);
  activities = signal<Activity[]>([]);
  selectedStaffId = signal<number | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.staffService.getAllStaffs().subscribe({
      next: (data: any[]) => {
        this.staffList.set(data);
      },
      error: () => {}
    });
  }

  onStaffChange(staffIdValue: string): void {
    if (!staffIdValue) {
      this.selectedStaffId.set(null);
      this.activities.set([]);
      this.error.set(null);
      this.loading.set(false);
      return;
    }

    const staffId = Number(staffIdValue);
    if (Number.isNaN(staffId)) {
      this.selectedStaffId.set(null);
      this.error.set('Selected staff member is invalid.');
      this.activities.set([]);
      return;
    }

    this.selectedStaffId.set(staffId);
    this.loadActivities(staffId);
  }

  loadActivities(staffId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.getActivitiesManagedBy(staffId).subscribe({
      next: (data: Activity[]) => {
        this.activities.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load managed activities.');
        this.loading.set(false);
      }
    });
  }

  viewActivity(id: number): void {
    this.router.navigate(['/admin/activities', id]);
  }
}
