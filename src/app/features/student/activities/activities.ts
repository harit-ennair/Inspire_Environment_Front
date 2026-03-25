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
  attendances?: ActivityAttendance[];
  presenceStatus?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

interface ActivityAttendance {
  student?: { id?: number };
  status?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

const TYPE_BADGE_CLASS: Record<string, string> = {
  SESSION: 'badge-session',
  WORKSHOP: 'badge-workshop',
  VISIT: 'badge-visit',
};

const PRESENCE_CLASS: Record<string, string> = {
  PRESENT: 'presence-present',
  ABSENT: 'presence-absent',
  LATE: 'presence-late',
  PENDING: 'presence-pending',
};

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
        this.activities.set(this.addStudentPresence(data, studentId));
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
      return this.isSameCalendarDay(new Date(activity.startDate), day.date);
    });
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  getTypeBadgeClass(type?: string): string {
    return TYPE_BADGE_CLASS[this.normalizeKey(type)] ?? 'badge-default';
  }

  getPresenceClass(status?: string): string {
    return PRESENCE_CLASS[this.normalizeKey(status)] ?? 'presence-none';
  }

  private addStudentPresence(data: CalendarActivity[], studentId: number): CalendarActivity[] {
    return data.map(activity => {
      const myAttendance = activity.attendances?.find(att => att.student?.id === studentId);
      return {
        ...activity,
        presenceStatus: myAttendance?.status,
        checkInTime: myAttendance?.checkInTime,
        checkOutTime: myAttendance?.checkOutTime,
      };
    });
  }

  private normalizeKey(value?: string): string {
    return value?.toUpperCase() ?? '';
  }

  private isSameCalendarDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
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
