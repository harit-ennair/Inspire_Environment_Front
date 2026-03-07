import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresenceService } from '../../../core/services/api/presence.service';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
  selector: 'app-presence',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './presence.html',
  styleUrl: './presence.css',
})
export class Presence implements OnInit {
  private presenceService = inject(PresenceService);
  private authService = inject(AuthService);

  presences = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  filterStatus = signal<string>('ALL');

  readonly STATUS_FILTERS = ['ALL', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'PENDING'];

  // Stats
  totalPresent = computed(() => this.presences().filter(p => p.status === 'PRESENT').length);
  totalAbsent = computed(() => this.presences().filter(p => p.status === 'ABSENT').length);
  totalLate = computed(() => this.presences().filter(p => p.status === 'LATE').length);
  totalRecords = computed(() => this.presences().length);

  attendanceRate = computed(() => {
    const total = this.totalRecords();
    if (total === 0) return 0;
    return Math.round(((this.totalPresent() + this.totalLate()) / total) * 100);
  });

  filteredPresences = computed(() => {
    const status = this.filterStatus();
    const list = this.presences();
    const filtered = status === 'ALL' ? list : list.filter(p => p.status === status);
    return filtered.sort((a: any, b: any) => {
      const dateA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const dateB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      return dateB - dateA;
    });
  });

  ngOnInit(): void {
    this.loadPresences();
  }

  loadPresences(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error.set('Unable to identify student. Please log in again.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.presenceService.getPresencesByStudent(Number(userId)).subscribe({
      next: (data: any[]) => {
        this.presences.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load presence records.');
        this.loading.set(false);
      }
    });
  }

  setFilter(status: string): void {
    this.filterStatus.set(status);
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PRESENT: 'status-present',
      ABSENT: 'status-absent',
      LATE: 'status-late',
      EXCUSED: 'status-excused',
      PENDING: 'status-pending',
    };
    return map[status] ?? 'status-default';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PRESENT': return '✓';
      case 'ABSENT': return '✗';
      case 'LATE': return '⏱';
      case 'EXCUSED': return '✎';
      case 'PENDING': return '⏳';
      default: return '—';
    }
  }
}
