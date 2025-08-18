import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PatientHistoryComponent } from './patient-history.component';

describe('PatientHistoryComponent', () => {
  let component: PatientHistoryComponent;
  let fixture: ComponentFixture<PatientHistoryComponent | null>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientHistoryComponent],
      declarations: [PatientHistoryComponent],
      providers: [] // Add any necessary providers here if needed 
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
