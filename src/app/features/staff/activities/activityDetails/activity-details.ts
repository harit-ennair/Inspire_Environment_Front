import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { TasksService } from '../../../../core/services/api/tasks.service';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-activity-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './activity-details.html',
  styleUrls: ['./activity-details.css'],
})
export class ActivityDetails implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private tasksService = inject(TasksService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activity = signal<Activity | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  activityId = signal<number>(0);

  // Tasks
  tasks = signal<any[]>([]);
  tasksLoading = signal<boolean>(false);
  showTaskForm = signal<boolean>(false);
  taskFormMode = signal<'create' | 'edit'>('create');
  editingTaskId = signal<number | null>(null);
  taskSaving = signal<boolean>(false);
  taskSuccess = signal<string | null>(null);
  taskError = signal<string | null>(null);
  taskForm = { title: '', description: '', deadline: '' };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.activityId.set(id);
    this.loadActivity(id);
    this.loadTasks(id);
  }

  loadActivity(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.getActivityById(id).subscribe({
      next: (data: Activity) => {
        this.activity.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load activity details.');
        this.loading.set(false);
      }
    });
  }

  loadTasks(activityId: number): void {
    this.tasksLoading.set(true);
    this.tasksService.getTasksByActivity(activityId).subscribe({
      next: (data: any[]) => {
        this.tasks.set(data);
        this.tasksLoading.set(false);
      },
      error: () => this.tasksLoading.set(false),
    });
  }

  openTaskForm(): void {
    this.taskFormMode.set('create');
    this.editingTaskId.set(null);
    this.taskForm = { title: '', description: '', deadline: '' };
    this.showTaskForm.set(true);
  }

  openEditTaskForm(task: any): void {
    this.taskFormMode.set('edit');
    this.editingTaskId.set(task.id);
    this.taskForm = {
      title: task.title || '',
      description: task.description || '',
      deadline: task.deadline ? task.deadline.substring(0, 16) : '',
    };
    this.showTaskForm.set(true);
  }

  closeTaskForm(): void {
    this.showTaskForm.set(false);
    this.taskSaving.set(false);
  }

  saveTask(): void {
    if (!this.taskForm.title.trim()) return;
    this.taskSaving.set(true);
    this.taskError.set(null);

    const payload: any = {
      title: this.taskForm.title.trim(),
      description: this.taskForm.description.trim() || null,
      deadline: this.taskForm.deadline || null,
      activityId: this.activityId(),
    };

    const isEdit = this.taskFormMode() === 'edit';
    const request = isEdit
      ? this.tasksService.updateTask(this.editingTaskId()!, payload)
      : this.tasksService.createTask(payload);

    request.subscribe({
      next: () => {
        this.taskSuccess.set(isEdit ? 'Task updated successfully.' : 'Task created successfully.');
        this.closeTaskForm();
        this.loadTasks(this.activityId());
        setTimeout(() => this.taskSuccess.set(null), 3000);
      },
      error: () => {
        this.taskSaving.set(false);
        this.taskError.set(isEdit ? 'Failed to update task.' : 'Failed to create task.');
        setTimeout(() => this.taskError.set(null), 4000);
      }
    });
  }

  deleteTask(task: any): void {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    this.tasksService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks.update(list => list.filter(t => t.id !== task.id));
        this.taskSuccess.set('Task deleted.');
        setTimeout(() => this.taskSuccess.set(null), 3000);
      },
      error: () => {
        this.taskError.set('Failed to delete task.');
        setTimeout(() => this.taskError.set(null), 4000);
      }
    });
  }

  formatDeadline(dateStr?: string): string {
    if (!dateStr) return 'No deadline';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  isOverdue(dateStr?: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  goToEdit(): void {
    this.router.navigate(['/admin/activities', this.activityId(), 'edit']);
  }

  goToAssign(): void {
    this.router.navigate(['/admin/activities', this.activityId(), 'assign']);
  }

  goToAttendance(): void {
    this.router.navigate(['/admin/activities', this.activityId(), 'attendance']);
  }

  goBack(): void {
    this.router.navigate(['/admin/activities']);
  }
}
