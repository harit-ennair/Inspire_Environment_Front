import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../../../core/services/api/roles.service';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css'],
})
export class RolesForm implements OnInit {

  // Inject services
  private rolesService = inject(RolesService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  // Signals
  role = signal<any>({ name: '' });
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  id = signal<number | null>(null);

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.isEdit.set(true);
      this.id.set(Number(paramId));
      this.loadRole(Number(paramId));
    }
  }

  loadRole(id: number) {
    this.loading.set(true);
    this.rolesService.getRoleById(id).subscribe({
      next: (data) => {
        this.role.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  save() {
    const data = this.role();

    if (this.isEdit()) {
      this.rolesService.updateRole(this.id()!, data).subscribe(() => {
        this.router.navigate(['/admin/roles']);
      });
    } else {
      this.rolesService.createRole(data).subscribe(() => {
        this.router.navigate(['/admin/roles']);
      });
    }
  }
}