import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVitals } from './patient-vitals.component';

describe('PatientVitals', () => {
  let component: PatientVitals;
  let fixture: ComponentFixture<PatientVitals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientVitals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientVitals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
