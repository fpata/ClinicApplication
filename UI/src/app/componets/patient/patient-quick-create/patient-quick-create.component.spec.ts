import { TestBed } from '@angular/core/testing';
import { PatientQuickCreateComponent } from './patient-quick-create.component';


describe('PatientQuickCreateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientQuickCreateComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PatientQuickCreateComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
