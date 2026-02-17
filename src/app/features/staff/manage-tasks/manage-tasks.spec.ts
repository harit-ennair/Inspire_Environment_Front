import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTasks } from './manage-tasks';

describe('ManageTasks', () => {
  let component: ManageTasks;
  let fixture: ComponentFixture<ManageTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTasks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
