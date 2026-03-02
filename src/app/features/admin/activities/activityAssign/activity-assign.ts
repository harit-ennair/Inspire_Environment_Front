import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActivitiesService } from '../../../../core/services/api/activities.service';
import { StudentsService } from '../../../../core/services/api/students.service';
import { StaffService } from '../../../../core/services/api/staff.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';
import { Activity } from '../models/activity.model';

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
    const q = this.studentSearch().toLowerCase();
    if (!q) return this.students();
    return this.students().filter(s => {
      const fn = (s.firstName || s.user?.firstName || '').toLowerCase();
      const ln = (s.lastName || s.user?.lastName || '').toLowerCase();
      return fn.includes(q) || ln.includes(q);
    });
  });

  filteredStaff = computed(() => {
    const q = this.staffSearch().toLowerCase();
    if (!q) return this.staffList();
    return this.staffList().filter(m => {
      const fn = (m.firstName || m.user?.firstName || '').toLowerCase();
      const ln = (m.lastName || m.user?.lastName || '').toLowerCase();
      return fn.includes(q) || ln.includes(q);
    });
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

    this.studentsService.getAllStudents().subscribe({
      next: (data: any[]) => this.students.set(data),
      error: () => {}
    });

    this.staffService.getAllStaffs().subscribe({
      next: (data: any[]) => this.staffList.set(data),
      error: () => {}
    });

    this.departmentsService.getAllDepartments().subscribe({
      next: (data: any[]) => this.departments.set(data),
      error: () => {}
    });
  }

  setTab(tab: 'student' | 'staff' | 'department'): void {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  assignStudent(): void {
    const studentId = this.selectedStudentId();
    if (!studentId) return;
    this.assigning.set(true);
    this.activitiesService.assignStudentToActivity(this.activityId(), studentId).subscribe({
      next: (updated: Activity) => {
        this.activity.set(updated);
        this.successMsg.set('Student assigned successfully.');
        this.selectedStudentId.set(null);
        this.studentSearch.set('');
        this.assigning.set(false);
        this.autoClearSuccess();
      },
      error: () => {
        this.error.set('Failed to assign student.');
        this.assigning.set(false);
      }
    });
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
    this.assigning.set(true);
    this.activitiesService.assignStaffToActivity(this.activityId(), staffId).subscribe({
      next: (updated: Activity) => {
        this.activity.set(updated);
        this.successMsg.set('Staff assigned successfully.');
        this.selectedStaffId.set(null);
        this.staffSearch.set('');
        this.assigning.set(false);
        this.autoClearSuccess();
      },
      error: () => {
        this.error.set('Failed to assign staff.');
        this.assigning.set(false);
      }
    });
  }

  assignDepartment(): void {
    const deptId = this.selectedDepartmentId();
    if (!deptId) return;
    this.assigning.set(true);
    this.activitiesService.assignDepartmentToActivity(this.activityId(), deptId).subscribe({
      next: (updated: Activity) => {
        this.activity.set(updated);
        this.successMsg.set('Department assigned successfully.');
        this.selectedDepartmentId.set(null);
        this.assigning.set(false);
        this.autoClearSuccess();
      },
      error: () => {
        this.error.set('Failed to assign department.');
        this.assigning.set(false);
      }
    });
  }

  private autoClearSuccess(): void {
    setTimeout(() => this.successMsg.set(null), 1000);
  }

  private clearMessages(): void {
    this.successMsg.set(null);
    this.error.set(null);
  }

  goBack(): void {
    this.router.navigate(['/admin/activities', this.activityId()]);
  }
}
