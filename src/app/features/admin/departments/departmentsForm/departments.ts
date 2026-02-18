import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentsService } from '../../../../core/services/api/departments.service';

@Component({
  selector: 'app-departments-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrls: ['./departments.css'],
})
export class DepartmentsForm implements OnInit {

  // Inject services
  private departmentsService = inject(DepartmentsService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  // Signals
  department = signal<any>({ name: '' });
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  id = signal<number | null>(null);

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.isEdit.set(true);
      this.id.set(Number(paramId));
      this.loadDepartment(Number(paramId));
    }
  }

  loadDepartment(id: number) {
    this.loading.set(true);
    this.departmentsService.getDepartmentById(id).subscribe({
      next: (data) => {
        this.department.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  save() {
    const data = this.department();

    if (this.isEdit()) {
      this.departmentsService.updateDepartment(this.id()!, data).subscribe(() => {
        this.router.navigate(['/admin/departments']);
      });
    } else {
      this.departmentsService.createDepartment(data).subscribe(() => {
        this.router.navigate(['/admin/departments']);
      });
    }
  }
}
