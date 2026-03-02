import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { StudentsService } from '../../../../core/services/api/students.service';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-activities-by-student',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activities-by-student.html',
  styleUrls: ['./activities-by-student.css'],
})
export class ActivitiesByStudent implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private studentsService = inject(StudentsService);
  private router = inject(Router);

  students = signal<any[]>([]);
  activities = signal<Activity[]>([]);
  weekActivities = signal<Activity[]>([]);
  selectedStudentId = signal<number | null>(null);
  loading = signal<boolean>(false);
  loadingWeek = signal<boolean>(false);
  error = signal<string | null>(null);
  showWeekOnly = signal<boolean>(false);

  ngOnInit(): void {
    this.studentsService.getAllStudents().subscribe({
      next: (data: any[]) => this.students.set(data),
      error: () => {}
    });
  }

  onStudentChange(id: number): void {
    this.selectedStudentId.set(Number(id));
    this.loadActivities(Number(id));
  }

  loadActivities(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.getActivitiesByStudent(id).subscribe({
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
    this.activitiesService.getActivitiesThisWeekByStudent(id).subscribe({
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
