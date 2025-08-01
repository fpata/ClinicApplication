import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInfoComponent } from './patient-info';

describe('PatientInfo', () => {
  let component: PatientInfoComponent;
  let fixture: ComponentFixture<PatientInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
