import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmissionsService } from '../../../core/services/api/submissions.service';

@Component({
    selector: 'app-submissions',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './submissions.html',
    styleUrl: './submissions.css',
})
export class StaffSubmissions implements OnInit {
    private submissionsService = inject(SubmissionsService);

    submissions = signal<any[]>([]);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);
    filterStatus = signal<string>('ALL');
    searchQuery = signal<string>('');

    readonly STATUS_FILTERS = ['ALL', 'PENDING', 'SUBMITTED', 'GRADED', 'LATE'];

    filteredSubmissions = computed(() => {
        const status = this.filterStatus();
        const query = this.searchQuery().toLowerCase().trim();
        let list = this.submissions();

        if (status !== 'ALL') {
            list = list.filter(s => (s.status || 'PENDING').toUpperCase() === status);
        }

        if (query) {
            list = list.filter(s => {
                const studentName = this.getStudentName(s).toLowerCase();
                const taskTitle = (s.task?.title || s.taskTitle || '').toLowerCase();
                return studentName.includes(query) || taskTitle.includes(query);
            });
        }

        return list;
    });

    totalAll = computed(() => this.submissions().length);
    totalPending = computed(() => this.submissions().filter(s => !s.status || s.status === 'PENDING').length);
    totalSubmitted = computed(() => this.submissions().filter(s => s.status === 'SUBMITTED').length);
    totalGraded = computed(() => this.submissions().filter(s => s.status === 'GRADED').length);

    ngOnInit(): void {
        this.loadSubmissions();
    }

    loadSubmissions(): void {
        this.loading.set(true);
        this.error.set(null);

        this.submissionsService.getAllSubmissions().subscribe({
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

    onSearch(event: Event): void {
        this.searchQuery.set((event.target as HTMLInputElement).value);
    }

    getStudentName(sub: any): string {
        if (sub.student?.user) {
            return `${sub.student.user.firstName || ''} ${sub.student.user.lastName || ''}`.trim();
        }
        if (sub.student) {
            return `${sub.student.firstName || ''} ${sub.student.lastName || ''}`.trim();
        }
        return sub.studentName || '—';
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
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    formatDateTime(dateStr?: string): string {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
            ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
}
