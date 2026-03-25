import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../../../core/services/api/students.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';

type StudentFormData = {
  studentCode: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    roleId: number | null;
    departmentId: number | null;
  };
};

@Component({
  selector: 'app-students-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
})
export class StudentsForm implements OnInit {
  private readonly defaultStudentRoleId = 3;

  // Inject services
  private studentsService = inject(StudentsService);
  private departmentsService = inject(DepartmentsService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  // Signals
  student = signal<StudentFormData>(this.createEmptyStudent());
  departments = signal<any[]>([]);
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  id = signal<number | null>(null);

  ngOnInit(): void {
    this.loadDepartments();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isFinite(id) && id > 0) {
      this.isEdit.set(true);
      this.id.set(id);
      this.loadStudent(id);
    }
  }

  private createEmptyStudent(): StudentFormData {
    return {
      studentCode: '',
      user: {
        firstName: '',
        lastName: '',
        email: '',
        roleId: null,
        departmentId: null,
      },
    };
  }

  private normalizeStudent(data: any): StudentFormData {
    const base = this.createEmptyStudent();
    return {
      studentCode: data?.studentCode ?? base.studentCode,
      user: {
        firstName: data?.user?.firstName ?? data?.firstName ?? base.user.firstName,
        lastName: data?.user?.lastName ?? data?.lastName ?? base.user.lastName,
        email: data?.user?.email ?? data?.email ?? base.user.email,
        roleId: data?.user?.roleId ?? data?.roleId ?? base.user.roleId,
        departmentId:
          data?.user?.departmentId ?? data?.departmentId ?? base.user.departmentId,
      },
    };
  }

  loadDepartments() {
    this.departmentsService.getAllDepartments().subscribe({
      next: (data) => this.departments.set(data),
      error: (err) => {
        console.error('Failed to load departments', err);
      },
    });
  }

  loadStudent(id: number) {
    this.loading.set(true);
    this.studentsService.getStudentById(id).subscribe({
      next: (data) => {
        this.student.set(this.normalizeStudent(data));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  save() {
    const current = this.student();
    const data: StudentFormData = {
      ...current,
      user: {
        ...current.user,
        roleId: current.user.roleId ?? this.defaultStudentRoleId,
      },
    };

    const request = this.isEdit() && this.id()
      ? this.studentsService.updateStudent(this.id()!, data)
      : this.studentsService.createStudent(data);

    request.subscribe(() => {
      this.router.navigate(['/admin/students']);
    });
  }
}
