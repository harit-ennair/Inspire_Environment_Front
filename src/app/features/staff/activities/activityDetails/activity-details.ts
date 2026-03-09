import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-activity-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './activity-details.html',
  styleUrls: ['./activity-details.css'],
})
export class ActivityDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activitiesService = inject(ActivitiesService);
  activity = signal<Activity | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  activityId = signal<number>(0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.activityId.set(id);
    this.loadActivity(id);
  }

  loadActivity(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.getActivityById(id).subscribe({
      next: (data: Activity) => {
        this.activity.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load activity details.');
        this.loading.set(false);
      }
    });
  }

  goToEdit(): void {
    this.router.navigate(['/admin/activities', this.activityId(), 'edit']);
  }

  goToAssign(): void {
    this.router.navigate(['/admin/activities', this.activityId(), 'assign']);
  }

  goToAttendance(): void {
    this.router.navigate(['/admin/activities', this.activityId(), 'attendance']);
  }

  goBack(): void {
    this.router.navigate(['/admin/activities']);
  }
}
