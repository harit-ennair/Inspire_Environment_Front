import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentsService } from '../../../../core/services/api/students.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
})
export class StudentsList implements OnInit {

  // Inject services
  private studentsService = inject(StudentsService);
  private departmentsService = inject(DepartmentsService);
  private router = inject(Router);

  // Signals
  students = signal<any[]>([]);
  departments = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Search & Pagination Signals
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);

  // Computed Values
  filteredStudents = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.students();

    return this.students().filter(student =>
      (student.firstName + ' ' + student.lastName).toLowerCase().includes(term) ||
      (student.email?.toLowerCase().includes(term)) ||
      (student.studentCode?.toLowerCase().includes(term))
    );
  });

  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredStudents().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredStudents().length / this.pageSize());
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  // Pagination Methods
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1); // Reset to first page on search
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadStudents();
  }

  loadDepartments() {
    this.departmentsService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments.set(data);
      },
      error: (err) => {
        console.error('Failed to load departments', err);
      }
    });
  }

  loadStudents() {
    this.loading.set(true);
    this.studentsService.getAllStudents().subscribe({
      next: (data) => {
        // Normalize the data structure if needed
        const normalizedData = data.map((student: any) => {
          if (student.user) {
            // If data has nested user object, flatten it for display
            return {
              ...student,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              email: student.user.email,
              departmentName: student.user.departmentName,
              roleName: student.user.roleName,
              departmentId: student.user.departmentId
            };
          }
          return student;
        });
        this.students.set(normalizedData);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load students');
        this.loading.set(false);
      }
    });
  }

  getDepartmentName(departmentName: string): string {
    return departmentName || 'N/A';
  }

  editStudent(id: number) {
    this.router.navigate(['/admin/students/edit', id]);
  }

  deleteStudent(id: number) {
    if (confirm('Are you sure you want to delete this student and his attendance records?')) {
      this.studentsService.deleteStudent(id).subscribe(() => {
        this.students.set(this.students().filter(s => s.id !== id));
      });
    }
  }
}
