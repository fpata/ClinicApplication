import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PatientMasterComponent } from './patient-master';

describe('PatientMaster', () => {
  let component: PatientMasterComponent;
  let fixture: ComponentFixture<PatientMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
