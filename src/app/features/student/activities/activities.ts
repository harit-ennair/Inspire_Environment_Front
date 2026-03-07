import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitiesService } from '../../../core/services/api/activities.service';
import { AuthService } from '../../../core/services/api/auth.service';

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  monthShort: string;
  isToday: boolean;
}

export interface CalendarActivity {
  id: number;
  title: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  managedBy?: string;
  attendances?: any[];
  presenceStatus?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activities.html',
  styleUrl: './activities.css',
})
export class Activities implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private authService = inject(AuthService);

  activities = signal<CalendarActivity[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentWeekStart = signal<Date>(this.getMonday(new Date()));

  weekDays = computed<WeekDay[]>(() => {
    const start = this.currentWeekStart();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      return {
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: dateOnly.getTime() === today.getTime(),
      };
    });
  });

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error.set('Unable to identify student. Please log in again.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const studentId = Number(userId);

    this.activitiesService.getActivitiesThisWeekByStudent(studentId).subscribe({
      next: (data: CalendarActivity[]) => {
        // Extract presence from the attendances array already in each activity
        const enriched = data.map(activity => {
          const myAttendance = activity.attendances?.find(
            (att: any) => att.student?.id === studentId
          );
          return {
            ...activity,
            presenceStatus: myAttendance?.status,
            checkInTime: myAttendance?.checkInTime,
            checkOutTime: myAttendance?.checkOutTime,
          };
        });
        this.activities.set(enriched);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load activities.');
        this.loading.set(false);
      }
    });
  }

  getActivitiesForDay(day: WeekDay): CalendarActivity[] {
    return this.activities().filter(activity => {
      if (!activity.startDate) return false;
      const actDate = new Date(activity.startDate);
      return (
        actDate.getFullYear() === day.date.getFullYear() &&
        actDate.getMonth() === day.date.getMonth() &&
        actDate.getDate() === day.date.getDate()
      );
    });
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  getTypeBadgeClass(type?: string): string {
    switch (type?.toUpperCase()) {
      case 'SESSION': return 'badge-session';
      case 'WORKSHOP': return 'badge-workshop';
      case 'VISIT': return 'badge-visit';
      default: return 'badge-default';
    }
  }

  getPresenceClass(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'PRESENT': return 'presence-present';
      case 'ABSENT': return 'presence-absent';
      case 'LATE': return 'presence-late';
      case 'EXCUSED': return 'presence-excused';
      case 'PENDING': return 'presence-pending';
      default: return 'presence-none';
    }
  }

  getPresenceIcon(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'PRESENT': return '✓';
      case 'ABSENT': return '✗';
      case 'LATE': return '⏱';
      case 'EXCUSED': return '✎';
      case 'PENDING': return '⏳';
      default: return '—';
    }
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
