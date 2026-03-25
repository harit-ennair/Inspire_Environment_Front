import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PresenceService } from '../../../core/services/api/presence.service';
import { ActivitiesService } from '../../../core/services/api/activities.service';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private presenceService = inject(PresenceService);
  private activitiesService = inject(ActivitiesService);
  private authService = inject(AuthService);
  private readonly successTimeoutMs = 3000;
  private readonly errorTimeoutMs = 4000;

  userName = this.authService.getUserName() || 'Student';
  today = new Date();

  // Check-in / Check-out state
  checkedIn = signal<boolean>(false);
  checkedOut = signal<boolean>(false);
  checkInTime = signal<string | null>(null);
  checkOutTime = signal<string | null>(null);
  checkLoading = signal<boolean>(false);
  checkError = signal<string | null>(null);
  checkSuccess = signal<string | null>(null);

  // Activities this week
  weekActivities = signal<any[]>([]);
  activitiesLoading = signal<boolean>(false);

  // Today's presences to detect if already checked in/out
  todayPresence = signal<any | null>(null);

  canCheckIn = computed(() => !this.checkedIn() && !this.checkLoading());
  canCheckOut = computed(() => this.checkedIn() && !this.checkedOut() && !this.checkLoading());

  navItems = [
    { label: 'Activities', route: '/student/activities' },
    { label: 'Presence', route: '/student/presence' },
  ];

  ngOnInit(): void {
    this.loadTodayPresence();
    this.loadWeekActivities();
  }

  private getUserId(): number | null {
    const userId = this.authService.getUserId();
    return userId ? Number(userId) : null;
  }

  private isToday(dateStr?: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).toDateString() === new Date().toDateString();
  }

  private showSuccess(message: string): void {
    this.checkSuccess.set(message);
    setTimeout(() => this.checkSuccess.set(null), this.successTimeoutMs);
  }

  private showError(message: string): void {
    this.checkError.set(message);
    setTimeout(() => this.checkError.set(null), this.errorTimeoutMs);
  }

  private updateFromTodayPresence(presence: any): void {
    this.todayPresence.set(presence);
    this.checkedIn.set(true);
    this.checkInTime.set(presence.checkInTime);

    if (presence.checkOutTime) {
      this.checkedOut.set(true);
      this.checkOutTime.set(presence.checkOutTime);
    }
  }

  private loadTodayPresence(): void {
    const userId = this.getUserId();
    if (userId === null) return;

    this.presenceService.getPresencesByStudent(userId).subscribe({
      next: (presences: any[]) => {
        const todayP = presences.find((p: any) => this.isToday(p.checkInTime));

        if (todayP) {
          this.updateFromTodayPresence(todayP);
        }
      },
      error: () => { }
    });
  }

  private loadWeekActivities(): void {
    const userId = this.getUserId();
    if (userId === null) return;

    this.activitiesLoading.set(true);
    this.activitiesService.getActivitiesThisWeekByStudent(userId).subscribe({
      next: (data: any[]) => {
        this.weekActivities.set(data.slice(0, 4));
        this.activitiesLoading.set(false);
      },
      error: () => this.activitiesLoading.set(false),
    });
  }

  doCheckIn(): void {
    const userId = this.getUserId();
    if (userId === null) return;

    this.checkLoading.set(true);
    this.checkError.set(null);

    this.presenceService.checkInPresence(userId).subscribe({
      next: (res: any) => {
        this.checkedIn.set(true);
        this.checkInTime.set(res.checkInTime || new Date().toISOString());
        this.showSuccess('Check-in successful!');
        this.checkLoading.set(false);
      },
      error: (err: any) => {
        this.showError(err.error?.message || 'Check-in failed. You may have already checked in today.');
        this.checkLoading.set(false);
      }
    });
  }

  doCheckOut(): void {
    const userId = this.getUserId();
    if (userId === null) return;

    this.checkLoading.set(true);
    this.checkError.set(null);

    this.presenceService.checkOutPresence(userId).subscribe({
      next: (res: any) => {
        this.checkedOut.set(true);
        this.checkOutTime.set(res.checkOutTime || new Date().toISOString());
        this.showSuccess('Check-out successful!');
        this.checkLoading.set(false);
      },
      error: (err: any) => {
        this.showError(err.error?.message || 'Check-out failed.');
        this.checkLoading.set(false);
      }
    });
  }

  formatTime(dateStr?: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  formatActivityTime(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}
