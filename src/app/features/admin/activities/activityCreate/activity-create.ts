import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { StaffService } from '../../../../core/services/api/staff.service';

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activity-create.html',
  styleUrls: ['./activity-create.css'],
})
export class ActivityCreate implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private staffService = inject(StaffService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);
  staffList = signal<any[]>([]);

  readonly activityTypes = ['SESSION', 'VISIT', 'WORKSHOP'];

  form: FormGroup = this.fb.group({
    title:     ['', [Validators.required, Validators.minLength(3)]],
    type:      ['SESSION', Validators.required],
    startTime: ['', Validators.required],
    endTime:   ['', Validators.required],
    managedBy: [null, Validators.required],
  });

  ngOnInit(): void {
    this.staffService.getAllStaffs().subscribe({
      next: (data: any[]) => this.staffList.set(data),
      error: () => {}
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.createActivity(this.form.value).subscribe({
      next: (created: any) => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/admin/activities', created.id]), 1200);
      },
      error: () => {
        this.error.set('Failed to create activity. Please try again.');
        this.loading.set(false);
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return 'Invalid value.';
  }

  cancel(): void {
    this.router.navigate(['/admin/activities']);
  }
}
