import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PresenceService } from '../../../core/services/api/presence.service';
import { DepartmentsService } from '../../../core/services/api/departments.service';
import { StudentsService } from '../../../core/services/api/students.service';

@Component({
  selector: 'app-presence',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './presence.html',
  styleUrl: './presence.css',
})
export class Presence implements OnInit {

  private presenceService  = inject(PresenceService);
  private departmentsService = inject(DepartmentsService);
  private studentsService   = inject(StudentsService);

  presences         = signal<any[]>([]);
  filteredPresences = signal<any[]>([]);
  departments       = signal<any[]>([]);
  allStudents       = signal<any[]>([]);
  studentOptions    = signal<any[]>([]);   // filtered by selected department
  studentSuggestions = signal<any[]>([]);
  loading           = signal<boolean>(true);
  error             = signal<string | null>(null);
  deleteSuccess     = signal<string | null>(null);
  updateSuccess     = signal<string | null>(null);
  editingPresence   = signal<any | null>(null);
  editSaving        = signal<boolean>(false);

  editForm = { status: '', checkInTime: '', checkOutTime: '' };

  // Filters
  departmentFilter = '';
  studentFilter    = '';   // selected student ID
  studentSearch    = '';   // search input text
  showSuggestions  = false;
  dateFilter       = '';   // single day  (nhar)
  statusFilter     = '';
  activeOnly       = false;

  readonly STATUS_OPTIONS = ['PENDING', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      presences:   this.presenceService.getAllPresences(),
      departments: this.departmentsService.getAllDepartments(),
      students:    this.studentsService.getAllStudents(),
    }).subscribe({
      next: ({ presences, departments, students }) => {
        // Normalise students that may have a nested `user` object
        const normalised = students.map((s: any) =>
          s.user ? { ...s, firstName: s.user.firstName, lastName: s.user.lastName,
                      departmentId: s.user.departmentId ?? s.departmentId,
                      departmentName: s.user.departmentName ?? s.departmentName } : s
        );
        this.presences.set(presences);
        this.departments.set(departments);
        this.allStudents.set(normalised);
        this.studentOptions.set(normalised);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load data.');
        this.loading.set(false);
      }
    });
  }

  onDepartmentChange(): void {
    this.studentFilter = '';
    this.studentSearch = '';
    this.studentSuggestions.set([]);
    this.showSuggestions = false;
    if (this.departmentFilter) {
      this.studentOptions.set(
        this.allStudents().filter(s => String(s.departmentId) === this.departmentFilter)
      );
    } else {
      this.studentOptions.set(this.allStudents());
    }
    this.applyFilters();
  }

  onStudentSearchInput(): void {
    const q = this.studentSearch.trim().toLowerCase();
    this.studentFilter = '';
    if (!q) {
      this.studentSuggestions.set([]);
      this.showSuggestions = false;
      this.applyFilters();
      return;
    }
    const matches = this.studentOptions().filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.studentCode && s.studentCode.toLowerCase().includes(q))
    );
    this.studentSuggestions.set(matches.slice(0, 8));
    this.showSuggestions = true;
  }

  selectStudent(student: any): void {
    this.studentSearch = `${student.firstName} ${student.lastName}`;
    this.studentFilter = String(student.id);
    this.showSuggestions = false;
    this.applyFilters();
  }

  clearStudentSearch(): void {
    this.studentSearch = '';
    this.studentFilter = '';
    this.studentSuggestions.set([]);
    this.showSuggestions = false;
    this.applyFilters();
  }

  applyFilters(): void {
    let result: any[] = this.presences();

    if (this.activeOnly) {
      result = result.filter(p => p.checkInTime && !p.checkOutTime);
    }

    if (this.statusFilter) {
      result = result.filter(p => p.status === this.statusFilter);
    }

    if (this.departmentFilter) {
      const dept = this.departments().find((d: any) => String(d.id) === this.departmentFilter);
      const deptName = dept?.name;
      result = result.filter(p => {
        const pDeptName = p.student?.user?.departmentName ?? p.departmentName;
        const pDeptId   = p.departmentId ?? p.student?.departmentId ?? p.student?.user?.departmentId;
        return (deptName && pDeptName === deptName) || String(pDeptId) === this.departmentFilter;
      });
    }

    if (this.studentFilter) {
      result = result.filter(p => {
        const sid = p.studentId ?? p.student?.id;
        return String(sid) === this.studentFilter;
      });
    }

    if (this.dateFilter) {
      result = result.filter(p => {
        if (!p.checkInTime) return false;
        return new Date(p.checkInTime).toDateString() === new Date(this.dateFilter).toDateString();
      });
    }

    result = result.sort((a, b) => {
      const dateA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const dateB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      return dateB - dateA;
    });

    this.filteredPresences.set(result);
  }

  resetFilters(): void {
    this.departmentFilter = '';
    this.studentFilter    = '';
    this.studentSearch    = '';
    this.dateFilter       = '';
    this.statusFilter     = '';
    this.activeOnly       = false;
    this.studentOptions.set(this.allStudents());
    this.studentSuggestions.set([]);
    this.showSuggestions  = false;
    this.applyFilters();
  }

  loadPresences(): void {
    this.loading.set(true);
    this.error.set(null);
    this.presenceService.getAllPresences().subscribe({
      next: (data) => {
        this.presences.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load presences.');
        this.loading.set(false);
      }
    });
  }

  openEditModal(p: any): void {
    this.editingPresence.set(p);
    this.editForm = {
      status:      p.status ?? '',
      checkInTime:  p.checkInTime  ? p.checkInTime.substring(0, 16)  : '',
      checkOutTime: p.checkOutTime ? p.checkOutTime.substring(0, 16) : '',
    };
  }

  closeEditModal(): void {
    this.editingPresence.set(null);
    this.editSaving.set(false);
  }

  saveEdit(): void {
    const p = this.editingPresence();
    if (!p) return;
    this.editSaving.set(true);
    const payload: any = { status: this.editForm.status };
    if (this.editForm.checkInTime)  payload.checkInTime  = this.editForm.checkInTime;
    if (this.editForm.checkOutTime) payload.checkOutTime = this.editForm.checkOutTime;
    this.presenceService.updatePresence(p.id, payload).subscribe({
      next: (updated: any) => {
        this.presences.update(list =>
          list.map(item => item.id === p.id ? { ...item, ...updated } : item)
        );
        this.applyFilters();
        this.closeEditModal();
        this.updateSuccess.set('Presence record updated successfully.');
        setTimeout(() => this.updateSuccess.set(null), 3000);
      },
      error: () => {
        this.editSaving.set(false);
        this.error.set('Failed to update presence record.');
      }
    });
  }

  deletePresence(id: number): void {
    if (!confirm('Are you sure you want to delete this presence record?')) return;
    this.presenceService.deletePresence(id).subscribe({
      next: () => {
        this.presences.set(this.presences().filter(p => p.id !== id));
        this.applyFilters();
        this.deleteSuccess.set('Presence record deleted successfully.');
        setTimeout(() => this.deleteSuccess.set(null), 3000);
      },
      error: () => this.error.set('Failed to delete presence record.')
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending',
      PRESENT: 'badge-present',
      ABSENT: 'badge-absent',
      LATE: 'badge-late',
      EXCUSED: 'badge-excused',
    };
    return map[status] ?? 'badge-default';
  }

  isActive(presence: any): boolean {
    return !!presence.checkInTime && !presence.checkOutTime;
  }

  get totalActive(): number {
    return this.presences().filter(p => this.isActive(p)).length;
  }

  get totalPresent(): number {
    return this.presences().filter(p => p.status === 'PRESENT').length;
  }

  get totalAbsent(): number {
    return this.presences().filter(p => p.status === 'ABSENT').length;
  }
}
