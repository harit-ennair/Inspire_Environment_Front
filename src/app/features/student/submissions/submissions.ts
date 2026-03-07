import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmissionsService } from '../../../core/services/api/submissions.service';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
  selector: 'app-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submissions.html',
  styleUrl: './submissions.css',
})
export class Submissions implements OnInit {
  private submissionsService = inject(SubmissionsService);
  private authService = inject(AuthService);

  submissions = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  filterStatus = signal<string>('ALL');

  readonly STATUS_FILTERS = ['ALL', 'PENDING', 'SUBMITTED', 'GRADED', 'LATE'];

  filteredSubmissions = computed(() => {
    const status = this.filterStatus();
    const list = this.submissions();
    if (status === 'ALL') return list;
    return list.filter(s => (s.status || 'PENDING').toUpperCase() === status);
  });

  totalPending = computed(() => this.submissions().filter(s => !s.status || s.status === 'PENDING').length);
  totalSubmitted = computed(() => this.submissions().filter(s => s.status === 'SUBMITTED').length);
  totalGraded = computed(() => this.submissions().filter(s => s.status === 'GRADED').length);

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error.set('Unable to identify student. Please log in again.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.submissionsService.getMySubmissions(Number(userId)).subscribe({
      next: (data: any[]) => {
        this.submissions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load submissions.');
        this.loading.set(false);
      }
    });
  }

  setFilter(status: string): void {
    this.filterStatus.set(status);
  }

  getStatusClass(status?: string): string {
    const s = (status || 'PENDING').toUpperCase();
    const map: Record<string, string> = {
      PENDING: 'status-pending',
      SUBMITTED: 'status-submitted',
      GRADED: 'status-graded',
      LATE: 'status-late',
    };
    return map[s] ?? 'status-default';
  }

  getStatusIcon(status?: string): string {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'PENDING': return '⏳';
      case 'SUBMITTED': return '✓';
      case 'GRADED': return '★';
      case 'LATE': return '⏱';
      default: return '—';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}