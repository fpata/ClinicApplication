import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSearchComponent } from './patient-search';

describe('PatientSearch', () => {
  let component: PatientSearchComponent;
  let fixture: ComponentFixture<PatientSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
