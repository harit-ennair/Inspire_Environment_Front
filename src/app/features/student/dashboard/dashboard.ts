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
    { label: 'Activities', icon: '📋', route: '/student/activities' },
    { label: 'Presence', icon: '📍', route: '/student/presence' },
  ];

  ngOnInit(): void {
    this.loadTodayPresence();
    this.loadWeekActivities();
  }

  private loadTodayPresence(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.presenceService.getPresencesByStudent(Number(userId)).subscribe({
      next: (presences: any[]) => {
        const todayStr = new Date().toDateString();
        const todayP = presences.find((p: any) => {
          if (!p.checkInTime) return false;
          return new Date(p.checkInTime).toDateString() === todayStr;
        });

        if (todayP) {
          this.todayPresence.set(todayP);
          this.checkedIn.set(true);
          this.checkInTime.set(todayP.checkInTime);
          if (todayP.checkOutTime) {
            this.checkedOut.set(true);
            this.checkOutTime.set(todayP.checkOutTime);
          }
        }
      },
      error: () => { }
    });
  }

  private loadWeekActivities(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.activitiesLoading.set(true);
    this.activitiesService.getActivitiesThisWeekByStudent(Number(userId)).subscribe({
      next: (data: any[]) => {
        this.weekActivities.set(data.slice(0, 4));
        this.activitiesLoading.set(false);
      },
      error: () => this.activitiesLoading.set(false),
    });
  }

  doCheckIn(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.checkLoading.set(true);
    this.checkError.set(null);

    this.presenceService.checkInPresence(Number(userId)).subscribe({
      next: (res: any) => {
        this.checkedIn.set(true);
        this.checkInTime.set(res.checkInTime || new Date().toISOString());
        this.checkSuccess.set('Check-in successful!');
        this.checkLoading.set(false);
        setTimeout(() => this.checkSuccess.set(null), 3000);
      },
      error: (err: any) => {
        this.checkError.set(err.error?.message || 'Check-in failed. You may have already checked in today.');
        this.checkLoading.set(false);
        setTimeout(() => this.checkError.set(null), 4000);
      }
    });
  }

  doCheckOut(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.checkLoading.set(true);
    this.checkError.set(null);

    this.presenceService.checkOutPresence(Number(userId)).subscribe({
      next: (res: any) => {
        this.checkedOut.set(true);
        this.checkOutTime.set(res.checkOutTime || new Date().toISOString());
        this.checkSuccess.set('Check-out successful!');
        this.checkLoading.set(false);
        setTimeout(() => this.checkSuccess.set(null), 3000);
      },
      error: (err: any) => {
        this.checkError.set(err.error?.message || 'Check-out failed.');
        this.checkLoading.set(false);
        setTimeout(() => this.checkError.set(null), 4000);
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
