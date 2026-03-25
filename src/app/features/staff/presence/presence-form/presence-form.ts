import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PresenceService } from '../../../../core/services/api/presence.service';
import { StudentsService } from '../../../../core/services/api/students.service';

@Component({
  selector: 'app-presence-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presence-form.html',
  styleUrls: ['./presence-form.css'],
})
export class PresenceForm implements OnInit {

  private readonly presenceService = inject(PresenceService);
  private readonly studentsService = inject(StudentsService);
  private readonly route = inject(ActivatedRoute);
  public readonly router = inject(Router);

  presence = signal<any>({
    status: '',
    checkInTime: '',
    checkOutTime: '',
    studentId: null
  });

  students = signal<any[]>([]);
  studentSuggestions = signal<any[]>([]);
  studentSearch = '';
  showSuggestions = false;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEdit = signal<boolean>(false);
  id = signal<number | null>(null);

  readonly STATUS_OPTIONS = ['PENDING', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

  ngOnInit(): void {
    this.loadStudents();

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const id = Number(paramId);
      this.isEdit.set(true);
      this.id.set(id);
      this.loadPresence(id);
    }
  }

  loadStudents(): void {
    this.studentsService.getAllStudents().subscribe({
      next: (data) => {
        this.students.set(data);
      },
      error: (err) => {
        console.error('Failed to load students', err);
      }
    });
  }

  loadPresence(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.presenceService.getPresenceById(id).subscribe({
      next: (data) => {
        this.setPresenceFromData(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.warn('getPresenceById failed, trying getAllPresences as fallback', err);
        this.presenceService.getAllPresences().subscribe({
          next: (list: any[]) => {
            const found = list.find((p) => p.id === id);
            if (found) {
              this.setPresenceFromData(found);
              return;
            } else {
              this.error.set('Presence record not found.');
            }
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Failed to load presence record.');
            this.loading.set(false);
          }
        });
      }
    });
  }

  private setPresenceFromData(data: any): void {
    const formatTime = (time: any) => {
      if (!time) {
        return '';
      }

      const value = String(time).replace(' ', 'T');
      return value.length >= 16 ? value.substring(0, 16) : value;
    };

    const formatted = {
      ...data,
      checkInTime: formatTime(data.checkInTime),
      checkOutTime: formatTime(data.checkOutTime),
      studentId: data.studentId ?? data.student?.id
    };

    this.presence.set(formatted);

    if (data.student) {
      this.studentSearch = this.getStudentName(data.student);
    }

    this.loading.set(false);
  }

  onStudentSearchInput(): void {
    const q = this.studentSearch.trim().toLowerCase();

    if (!q) {
      this.studentSuggestions.set([]);
      this.showSuggestions = false;
      return;
    }

    const matches = this.students().filter(s => {
      const name = this.getStudentName(s).toLowerCase();
      const code = (s.studentCode || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });

    this.studentSuggestions.set(matches.slice(0, 8));
    this.showSuggestions = true;
  }

  selectStudent(student: any): void {
    this.studentSearch = this.getStudentName(student);
    this.presence.update(p => ({ ...p, studentId: student.id }));
    this.showSuggestions = false;
  }

  clearStudentSearch(): void {
    this.studentSearch = '';
    this.presence.update(p => ({ ...p, studentId: null }));
    this.studentSuggestions.set([]);
    this.showSuggestions = false;
  }

  private getStudentName(student: any): string {
    const firstName = student?.user?.firstName || student?.firstName || '';
    const lastName = student?.user?.lastName || student?.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  save(): void {
    const data = this.presence();
    this.loading.set(true);

    const request$ = this.isEdit()
      ? this.presenceService.updatePresence(this.id()!, data)
      : this.presenceService.createPresence(data);

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => {
          this.router.navigate(['/staff/presence']);
        }
      });
  }
}
