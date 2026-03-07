import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../../core/services/api/tasks.service';
import { ActivitiesService } from '../../../core/services/api/activities.service';

@Component({
    selector: 'app-staff-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tasks.html',
    styleUrl: './tasks.css',
})
export class StaffTasks implements OnInit {
    private tasksService = inject(TasksService);
    private activitiesService = inject(ActivitiesService);

    tasks = signal<any[]>([]);
    activities = signal<any[]>([]);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);
    successMsg = signal<string | null>(null);
    searchQuery = signal<string>('');

    // Form state
    showForm = signal<boolean>(false);
    formMode = signal<'edit'>('edit');
    formSaving = signal<boolean>(false);
    editingTaskId = signal<number | null>(null);
    form = {
        title: '',
        description: '',
        deadline: '',
    };

    filteredTasks = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.tasks();
        return this.tasks().filter(t =>
            (t.title || '').toLowerCase().includes(q) ||
            (t.activity?.title || '').toLowerCase().includes(q)
        );
    });

    ngOnInit(): void {
        this.loadTasks();
        this.loadActivities();
    }

    loadTasks(): void {
        this.loading.set(true);
        this.error.set(null);
        this.tasksService.getAllTasks().subscribe({
            next: (data: any[]) => {
                this.tasks.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Failed to load tasks.');
                this.loading.set(false);
            }
        });
    }

    loadActivities(): void {
        this.activitiesService.getAllActivities().subscribe({
            next: (data: any[]) => this.activities.set(data),
            error: () => { }
        });
    }

    onSearch(event: Event): void {
        this.searchQuery.set((event.target as HTMLInputElement).value);
    }

    // Form actions

    openEditForm(task: any): void {
        this.formMode.set('edit');
        this.editingTaskId.set(task.id);
        this.form = {
            title: task.title || '',
            description: task.description || '',
            deadline: task.deadline ? task.deadline.substring(0, 16) : '',
        };
        this.showForm.set(true);
    }

    closeForm(): void {
        this.showForm.set(false);
        this.formSaving.set(false);
    }

    saveTask(): void {
        if (!this.form.title.trim()) return;

        this.formSaving.set(true);
        const payload: any = {
            title: this.form.title.trim(),
            description: this.form.description.trim() || null,
            deadline: this.form.deadline || null,
        };

        const id = this.editingTaskId();
        if (!id) return;
        this.tasksService.updateTask(id, payload).subscribe({
            next: () => {
                this.showSuccess('Task updated successfully.');
                this.closeForm();
                this.loadTasks();
            },
            error: () => {
                this.formSaving.set(false);
                this.error.set('Failed to update task.');
            }
        });
    }

    deleteTask(task: any): void {
        if (!confirm(`Delete task "${task.title}"?`)) return;
        this.tasksService.deleteTask(task.id).subscribe({
            next: () => {
                this.tasks.update(list => list.filter(t => t.id !== task.id));
                this.showSuccess('Task deleted.');
            },
            error: () => this.error.set('Failed to delete task.')
        });
    }

    private showSuccess(msg: string): void {
        this.successMsg.set(msg);
        setTimeout(() => this.successMsg.set(null), 3000);
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

    getActivityName(task: any): string {
        return task.activity?.title || '—';
    }

    isOverdue(task: any): boolean {
        if (!task.deadline) return false;
        return new Date(task.deadline) < new Date();
    }
}
