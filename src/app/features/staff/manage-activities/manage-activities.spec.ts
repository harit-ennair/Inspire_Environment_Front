import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageActivities } from './manage-activities';

describe('ManageActivities', () => {
  let component: ManageActivities;
  let fixture: ComponentFixture<ManageActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageActivities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageActivities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
