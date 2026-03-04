import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  staffList = signal<any[]>([]);
  activities = signal<Activity[]>([]);
  selectedEmail = signal<string>('');
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const emailParam = this.route.snapshot.paramMap.get('email');
    this.staffService.getAllStaffs().subscribe({
      next: (data: any[]) => {
        this.staffList.set(data);
        if (emailParam) {
          this.selectedEmail.set(emailParam);
          this.loadActivities(emailParam);
        }
      },
      error: () => {}
    });
  }

  onStaffChange(email: string): void {
    this.selectedEmail.set(email);
    this.loadActivities(email);
  }

  loadActivities(email: string): void {
    if (!email) return;
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.getActivitiesManagedBy(email).subscribe({
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
