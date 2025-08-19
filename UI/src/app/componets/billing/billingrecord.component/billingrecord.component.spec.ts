import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BillingrecordComponent } from './billingrecord.component';
import { BillingRecord, BillingStatus } from '../../../models/billing.model';

describe('BillingrecordComponent', () => {
  let component: BillingrecordComponent;
  let fixture: ComponentFixture<BillingrecordComponent>;

  const mockBillingRecord: BillingRecord = {
    ID: 1,
    PatientName: 'John Doe',
    DoctorName: 'Dr. Smith',
    TreatmentName: 'Check-up',
    ServiceDate: new Date('2025-08-19').toDateString(),
    Status: BillingStatus.PartiallyPaid,
    Subtotal: 100,
    TaxTotal: 10,
    DiscountTotal: 5,
    Total: 105,
    AmountPaid: 50,
    BalanceDue: 55,
    Notes: 'Annual check-up.',
    IsActive: 1,
    CreatedBy: 1,
    ModifiedBy: 1,
    CreatedDate: new Date().toDateString(),
    ModifiedDate: new Date().toDateString()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingrecordComponent ],
      imports: [ FormsModule ] // Import FormsModule for ngModel
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingrecordComponent);
    component = fixture.componentInstance;
    // Set the input property before the first change detection
    component.billingRecord = { ...mockBillingRecord };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display billing record data in form fields', () => {
    const patientNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtPatientName')).nativeElement;
    const doctorNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtDoctorName')).nativeElement;
    const totalInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtTotal')).nativeElement;

    expect(patientNameInput.value).toBe(mockBillingRecord.PatientName);
    expect(doctorNameInput.value).toBe(mockBillingRecord.DoctorName);
    expect(Number(totalInput.value)).toBe(mockBillingRecord.Total);
  });

  it('should update the component model when patient name is changed', async () => {
    const patientNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtPatientName')).nativeElement;
    const newPatientName = 'Jane Doe';

    patientNameInput.value = newPatientName;
    patientNameInput.dispatchEvent(new Event('input'));
    
    await fixture.whenStable(); // Wait for async data binding to complete

    expect(component.billingRecord.PatientName).toBe(newPatientName);
  });

  it('should update the component model when total is changed', async () => {
    const totalInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtTotal')).nativeElement;
    const newTotal = 150;

    totalInput.value = newTotal.toString();
    totalInput.dispatchEvent(new Event('input'));

    await fixture.whenStable();

    expect(component.billingRecord.Total).toBe(newTotal);
  });

  it('should update the component model when notes are changed', async () => {
    const notesTextarea: HTMLTextAreaElement = fixture.debugElement.query(By.css('#txtNotes')).nativeElement;
    const newNotes = 'Follow-up required.';

    notesTextarea.value = newNotes;
    notesTextarea.dispatchEvent(new Event('input'));

    await fixture.whenStable();

    expect(component.billingRecord.Notes).toBe(newNotes);
  });
});
