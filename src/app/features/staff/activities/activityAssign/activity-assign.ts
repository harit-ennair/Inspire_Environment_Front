import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { StudentsService } from '../../../../core/services/api/students.service';
import { StaffService } from '../../../../core/services/api/staff.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';
import { Activity } from '../models/activity.model';
import { Observable } from 'rxjs';

type PersonLike = {
  firstName?: string;
  lastName?: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
};

@Component({
  selector: 'app-activity-assign',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activity-assign.html',
  styleUrls: ['./activity-assign.css'],
})
export class ActivityAssign implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private studentsService = inject(StudentsService);
  private staffService = inject(StaffService);
  private departmentsService = inject(DepartmentsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activityId = signal<number>(0);
  activity = signal<Activity | null>(null);
  activeTab = signal<'student' | 'staff' | 'department'>('student');

  // Data lists
  students = signal<any[]>([]);
  staffList = signal<any[]>([]);
  departments = signal<any[]>([]);

  // Search terms
  studentSearch = signal<string>('');
  staffSearch = signal<string>('');

  // Filtered lists
  filteredStudents = computed(() => {
    return this.filterByName(this.students(), this.studentSearch());
  });

  filteredStaff = computed(() => {
    return this.filterByName(this.staffList(), this.staffSearch());
  });

  // Selected IDs
  selectedStudentId = signal<number | null>(null);
  selectedStaffId = signal<number | null>(null);
  selectedDepartmentId = signal<number | null>(null);

  // UI state
  loading = signal<boolean>(true);
  assigning = signal<boolean>(false);
  removing = signal<number | null>(null);
  successMsg = signal<string | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.activityId.set(id);
    this.loadAll(id);
  }

  loadAll(id: number): void {
    this.loading.set(true);
    this.activitiesService.getActivityById(id).subscribe({
      next: (data: Activity) => {
        this.activity.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load activity.');
        this.loading.set(false);
      }
    });

    this.loadSilent(this.studentsService.getAllStudents(), data => this.students.set(data));
    this.loadSilent(this.staffService.getAllStaffs(), data => this.staffList.set(data));
    this.loadSilent(this.departmentsService.getAllDepartments(), data => this.departments.set(data));
  }

  setTab(tab: 'student' | 'staff' | 'department'): void {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  assignStudent(): void {
    const studentId = this.selectedStudentId();
    if (!studentId) return;
    this.runAssign(
      this.activitiesService.assignStudentToActivity(this.activityId(), studentId),
      'Student assigned successfully.',
      'Failed to assign student.',
      () => {
        this.router.navigate(['/staff/activities', this.activityId()]);
        this.selectedStudentId.set(null);
        this.studentSearch.set('');
      }
    );
  }

  removeStudent(studentId: number): void {
    this.removing.set(studentId);
    this.activitiesService.removeStudentFromActivity(this.activityId(), studentId).subscribe({
      next: (updated: Activity) => {
        this.activity.set(updated);
        this.successMsg.set('Student removed successfully.');
        this.removing.set(null);
        this.autoClearSuccess();
      },
      error: () => {
        this.error.set('Failed to remove student.');
        this.removing.set(null);
      }
    });
  }

  assignStaff(): void {
    const staffId = this.selectedStaffId();
    if (!staffId) return;
    this.runAssign(
      this.activitiesService.assignStaffToActivity(this.activityId(), staffId),
      'Staff assigned successfully.',
      'Failed to assign staff.',
      () => {
        this.router.navigate(['/staff/activities', this.activityId()]);
        this.selectedStaffId.set(null);
        this.staffSearch.set('');
      }
    );
  }

  assignDepartment(): void {
    const deptId = this.selectedDepartmentId();
    if (!deptId) return;
    this.runAssign(
      this.activitiesService.assignDepartmentToActivity(this.activityId(), deptId),
      'Department assigned successfully.',
      'Failed to assign department.',
      () => {
        this.router.navigate(['/staff/activities', this.activityId()]);
        this.selectedDepartmentId.set(null);
      }
    );
  }

  private autoClearSuccess(): void {
    setTimeout(() => this.successMsg.set(null), 1000);
  }

  private filterByName<T extends PersonLike>(items: T[], query: string): T[] {
    const q = query.toLowerCase();
    if (!q) return items;

    return items.filter(item => {
      const firstName = (item.firstName || item.user?.firstName || '').toLowerCase();
      const lastName = (item.lastName || item.user?.lastName || '').toLowerCase();
      return firstName.includes(q) || lastName.includes(q);
    });
  }

  private runAssign(
    request: Observable<Activity>,
    successMessage: string,
    errorMessage: string,
    onSuccess: () => void
  ): void {
    this.assigning.set(true);
    this.clearMessages();

    request.subscribe({
      next: (updated: Activity) => {
        this.activity.set(updated);
        this.successMsg.set(successMessage);
        onSuccess();
        this.assigning.set(false);
        this.autoClearSuccess();
      },
      error: () => {
        this.error.set(errorMessage);
        this.assigning.set(false);
      }
    });
  }

  private loadSilent<T>(request: Observable<T>, onSuccess: (data: T) => void): void {
    request.subscribe({
      next: onSuccess,
      error: () => {}
    });
  }

  private clearMessages(): void {
    this.successMsg.set(null);
    this.error.set(null);
  }

  goBack(): void {
    this.router.navigate(['/admin/activities', this.activityId()]);
  }
}
