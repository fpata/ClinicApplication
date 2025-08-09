import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PatientCompleteHistoryComponent } from './patientcompletehistory';

describe('Patientcompletehistory', () => {
  let component: PatientCompleteHistoryComponent;
  let fixture: ComponentFixture<PatientCompleteHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientCompleteHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientCompleteHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
