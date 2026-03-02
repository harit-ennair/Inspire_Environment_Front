import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { StaffService } from '../../../../core/services/api/staff.service';

@Component({
  selector: 'app-activity-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activity-edit.html',
  styleUrls: ['./activity-edit.css'],
})
export class ActivityEdit implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private staffService = inject(StaffService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);
  activityId = signal<number>(0);
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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.activityId.set(id);
    this.staffService.getAllStaffs().subscribe({
      next: (data: any[]) => this.staffList.set(data),
      error: () => {}
    });
    this.loadActivity(id);
  }

  loadActivity(id: number): void {
    this.activitiesService.getActivityById(id).subscribe({
      next: (data: any) => {
        this.form.patchValue({
          title:     data.title     || '',
          type:      data.type      || 'SESSION',
          // Response uses startDate/endDate; slice to 16 chars for datetime-local input
          startTime: data.startDate ? data.startDate.substring(0, 16) : '',
          endTime:   data.endDate   ? data.endDate.substring(0, 16)   : '',
          managedBy: data.staff?.id || null,
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load activity for editing.');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.activitiesService.updateActivity(this.activityId(), this.form.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/admin/activities', this.activityId()]), 1200);
      },
      error: () => {
        this.error.set('Failed to update activity.');
        this.saving.set(false);
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
    this.router.navigate(['/admin/activities', this.activityId()]);
  }
}
