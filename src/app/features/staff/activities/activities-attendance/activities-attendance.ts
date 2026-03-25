import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AttendanceService } from '../../../../core/services/api/attendance.service';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { Activity } from '../models/activity.model';

type AttendanceRecord = {
  id: number;
  status: string;
  checkInTime?: string;
  student?: {
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
};

@Component({
  selector: 'app-activities-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './activities-attendance.html',
  styleUrl: './activities-attendance.css',
})
export class ActivitiesAttendance implements OnInit {

  private attendanceService = inject(AttendanceService);
  private activitiesService = inject(ActivitiesService);
  private route = inject(ActivatedRoute);

  attendances = signal<AttendanceRecord[]>([]);
  activity = signal<Activity | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  activityId = signal<number>(0);
  updatingId = signal<number | null>(null);
  editingTimeId = signal<number | null>(null);
  checkInTimeValue = signal<string>('');
  settingTimeId = signal<number | null>(null);

  readonly statuses = ['PRESENT', 'ABSENT', 'LATE'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.loading.set(false);
      this.error.set('Invalid activity id.');
      return;
    }

    this.activityId.set(id);
    this.loadAttendances(id);
    this.activitiesService.getActivityById(id).subscribe({
      next: (data: Activity) => this.activity.set(data),
      error: () => { }
    });
  }

  loadAttendances(activityId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.attendanceService.getAttendancesByActivity(activityId).subscribe({
      next: (data) => {
        this.attendances.set(Array.isArray(data) ? data : []);
        this.finishLoading();
      },
      error: (err: HttpErrorResponse) => {
        this.handleAttendancesLoadError(err);
        this.finishLoading();
      }
    });
  }

  startEditCheckInTime(record: AttendanceRecord): void {
    const current = record.checkInTime
      ? new Date(record.checkInTime).toISOString().slice(0, 16)
      : '';
    this.checkInTimeValue.set(current);
    this.editingTimeId.set(record.id);
  }

  cancelEditCheckInTime(): void {
    this.resetCheckInEditor();
  }

  saveCheckInTime(attendanceId: number): void {
    const value = this.checkInTimeValue();
    if (!value) return;
    this.settingTimeId.set(attendanceId);
    this.attendanceService.setCheckInTime(attendanceId, value).subscribe({
      next: () => {
        this.settingTimeId.set(null);
        this.resetCheckInEditor();
        this.reloadAttendances();
      },
      error: () => this.settingTimeId.set(null)
    });
  }

  updateStatus(attendanceId: number, status: string): void {
    this.updatingId.set(attendanceId);
    this.attendanceService.updateAttendanceStatus(attendanceId, status).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.reloadAttendances();
      },
      error: () => this.updatingId.set(null)
    });
  }

  getStudentName(record: AttendanceRecord): string {
    const user = record?.student?.user;
    if (!user) return '—';
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '—';
  }

  getStudentInitial(record: AttendanceRecord): string {
    const user = record?.student?.user;
    return (user?.firstName?.[0] ?? user?.email?.[0] ?? 'S').toUpperCase();
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PRESENT: 'status-present',
      ABSENT: 'status-absent',
      LATE: 'status-late',
      PENDING: 'status-pending',
    };
    return map[status] ?? 'status-default';
  }

  private reloadAttendances(): void {
    this.loadAttendances(this.activityId());
  }

  private resetCheckInEditor(): void {
    this.editingTimeId.set(null);
    this.checkInTimeValue.set('');
  }

  private finishLoading(): void {
    this.loading.set(false);
  }

  private handleAttendancesLoadError(err: HttpErrorResponse): void {
    if (err.status === 404) {
      // No records yet, show empty state.
      this.attendances.set([]);
      this.error.set(null);
      return;
    }

    if (err.status === 500) {
      this.error.set(`Server error (500): ${err.error?.message ?? 'An internal server error occurred. Please check the backend.'}`);
      return;
    }

    if (err.status === 0) {
      this.error.set('Cannot reach the server.');
      return;
    }

    this.error.set(`Error ${err.status}: ${err.error?.message ?? err.message}`);
  }
}
