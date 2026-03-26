import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresenceService } from '../../../core/services/api/presence.service';
import { AuthService } from '../../../core/services/api/auth.service';

type PresenceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'PENDING';

interface PresenceRecord {
  id: number;
  status: PresenceStatus;
  checkInTime?: string;
  checkOutTime?: string;
}

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

  presences = signal<PresenceRecord[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  filterStatus = signal<string>('ALL');
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);

  readonly STATUS_FILTERS: Array<'ALL' | PresenceStatus> = [
    'ALL',
    'PRESENT',
    'ABSENT',
    'LATE',
    'PENDING',
  ];

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
    const filtered = status === 'ALL' ? list : list.filter((p) => p.status === status);

    return [...filtered].sort((a, b) => this.toTimestamp(b.checkInTime) - this.toTimestamp(a.checkInTime));
  });

  totalPages = computed(() => {
    const total = Math.ceil(this.filteredPresences().length / this.pageSize());
    return Math.max(1, total);
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  paginatedPresences = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredPresences().slice(start, end);
  });

  pageStart = computed(() => {
    if (this.filteredPresences().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  pageEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredPresences().length);
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
      next: (data: PresenceRecord[]) => {
        this.presences.set(data ?? []);
        this.currentPage.set(1);
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
    this.currentPage.set(1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';

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
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';

    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';

    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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

  private toTimestamp(dateStr?: string): number {
    if (!dateStr) return 0;
    const time = new Date(dateStr).getTime();
    return Number.isNaN(time) ? 0 : time;
  }
}
