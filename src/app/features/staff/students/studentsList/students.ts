import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../../../core/services/api/students.service';

interface Student {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  studentCode?: string;
  departmentName?: string;
  roleName?: string;
  departmentId?: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    departmentName?: string;
    roleName?: string;
    departmentId?: number;
  };
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
})
export class StudentsList implements OnInit {

  private studentsService = inject(StudentsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  students = signal<Student[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(8);

  filteredStudents = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.students();
    }

    return this.students().filter((student) => {
      const fullName = `${student.firstName ?? ''} ${student.lastName ?? ''}`.toLowerCase();
      return (
        fullName.includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.studentCode?.toLowerCase().includes(term)
      );
    });
  });

  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredStudents().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredStudents().length / this.pageSize()));
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  nextPage() {
    this.currentPage.update((p) => Math.min(this.totalPages(), p + 1));
  }

  prevPage() {
    this.currentPage.update((p) => Math.max(1, p - 1));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents() {
    this.loading.set(true);
    this.error.set(null);
    this.studentsService.getAllStudents().subscribe({
      next: (data) => {
        this.students.set(data.map((student: Student) => this.normalizeStudent(student)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load students');
        this.loading.set(false);
      }
    });
  }

  private normalizeStudent(student: Student): Student {
    if (!student.user) {
      return student;
    }

    return {
      ...student,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      departmentName: student.user.departmentName,
      roleName: student.user.roleName,
      departmentId: student.user.departmentId,
    };
  }

  editStudent(id: number) {
    this.router.navigate(['edit', id], { relativeTo: this.route });
  }

  deleteStudent(id: number) {
    if (confirm('Are you sure you want to delete this student and his attendance records?')) {
      this.studentsService.deleteStudent(id).subscribe(() => {
        this.students.set(this.students().filter((student) => student.id !== id));
      });
    }
  }
}
