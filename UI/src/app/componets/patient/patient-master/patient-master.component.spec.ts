import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { PatientMasterComponent } from './patient-master.component';
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { UtilityService } from '../../../services/utility.service';
import { MessageService } from '../../../services/message.service';
import { MockDataHelper } from '../../../testing/mock-data.helper';
import { Patient } from '../../../models/patient.model';
import { User } from '../../../models/user.model';

// Mock child components
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-patient-appointment', template: '<div>Mock Patient Appointment</div>' })
class MockPatientAppointmentComponent { }

@Component({ selector: 'app-patient-history', template: '<div>Mock Patient History</div>' })
class MockPatientHistoryComponent { }

@Component({ selector: 'app-patient-report', template: '<div>Mock Patient Report</div>' })
class MockPatientReportComponent { }

@Component({ selector: 'app-patient-search', template: '<div>Mock Patient Search</div>' })
class MockPatientSearchComponent { }

@Component({ selector: 'app-patient-treatment', template: '<div>Mock Patient Treatment</div>' })
class MockPatientTreatmentComponent { }

@Component({ 
  selector: 'app-patient-complete-history', 
  template: '<div>Mock Patient Complete History</div>' 
})
class MockPatientCompleteHistoryComponent {
  patientTreatments: any[] = [];
  GetAllTreatmentsForUser(userID: number): void {
    // Mock implementation
  }
}

@Component({ 
  selector: 'app-patient-quick-create', 
  template: '<div>Mock Patient Quick Create</div>' 
})
class MockPatientQuickCreateComponent {
  patient: Patient = MockDataHelper.createMockPatient();
}

@Component({ selector: 'app-patient-vitals', template: '<div>Mock Patient Vitals</div>' })
class MockPatientVitalsComponent { }

describe('PatientMasterComponent', () => {
  let component: PatientMasterComponent;
  let fixture: ComponentFixture<PatientMasterComponent>;
  let dataService: jasmine.SpyObj<DataService>;
  let patientService: jasmine.SpyObj<PatientService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockUser = MockDataHelper.createMockUser();
  const mockPatient = MockDataHelper.createMockPatient();

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', 
      ['getUser', 'getPatient', 'setUser', 'setPatient']);
    const patientServiceSpy = jasmine.createSpyObj('PatientService', 
      ['createPatient', 'updatePatient', 'deletePatient']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', 
      ['formatDateTime']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', 
      ['success', 'error', 'info']);

    await TestBed.configureTestingModule({
      imports: [PatientMasterComponent, HttpClientTestingModule],
      declarations: [
        MockPatientAppointmentComponent,
        MockPatientHistoryComponent,
        MockPatientReportComponent,
        MockPatientSearchComponent,
        MockPatientTreatmentComponent,
        MockPatientCompleteHistoryComponent,
        MockPatientQuickCreateComponent,
        MockPatientVitalsComponent
      ],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: UtilityService, useValue: utilityServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientMasterComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    patientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    // Setup default return values
    dataService.getUser.and.returnValue(mockUser);
    dataService.getPatient.and.returnValue(mockPatient);
    utilityService.formatDateTime.and.returnValue('2023-08-19T10:00:00');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with search tab selected', () => {
    expect(component.isSearchTabSelected).toBeTrue();
    expect(component.selectedTab).toBe('tbPatientSearch');
    expect(component.userID).toBe(0);
  });

  describe('Tab Selection', () => {
    it('should handle patient search tab selection', () => {
      const mockEvent = {
        currentTarget: { id: 'tbPatientSearch-tab' }
      } as unknown as MouseEvent;

      const result = component.tabSelectedEvent(mockEvent);

      expect(component.isSearchTabSelected).toBeTrue();
      expect(component.selectedTab).toBe('tbPatientSearch-tab');
      expect(result).toBeTrue();
    });

    it('should handle non-search tab selection', () => {
      const mockEvent = {
        currentTarget: { id: 'tbPatientInfo-tab' }
      } as unknown as MouseEvent;

      const result = component.tabSelectedEvent(mockEvent);

      expect(component.isSearchTabSelected).toBeFalse();
      expect(component.selectedTab).toBe('tbPatientInfo-tab');
      expect(result).toBeTrue();
    });
  });

  describe('Clear Patient Information', () => {
    it('should clear all patient data', () => {
      component.patientCompleteHistoryComponent = jasmine.createSpyObj('PatientCompleteHistoryComponent', [], {
        patientTreatments: [1, 2, 3]
      });

      component.ClearPatientInformation();

      expect(dataService.setPatient).toHaveBeenCalledWith(null);
      expect(dataService.setUser).toHaveBeenCalledWith(null);
      expect(component.patientCompleteHistoryComponent.patientTreatments).toEqual([]);
      expect(component.userID).toBe(0);
    });
  });

  describe('Delete Patient Information', () => {
    it('should delete patient successfully', () => {
      const patientWithUser = { ...mockPatient, user: mockUser };
      dataService.getPatient.and.returnValue(patientWithUser);
      patientService.deletePatient.and.returnValue(of(undefined));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'ClearPatientInformation');

      component.DeletePatientInformation();

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete patient: John Doe?');
      expect(patientService.deletePatient).toHaveBeenCalledWith(mockPatient.ID);
      expect(messageService.success).toHaveBeenCalledWith('Patient deleted successfully');
      expect(component.ClearPatientInformation).toHaveBeenCalled();
    });

    it('should show error when no patient is selected', () => {
      dataService.getPatient.and.returnValue(null);

      component.DeletePatientInformation();

      expect(messageService.error).toHaveBeenCalledWith('No patient selected for deletion');
      expect(patientService.deletePatient).not.toHaveBeenCalled();
    });
  });

  describe('Add New Patient', () => {
    it('should create new patient successfully', () => {
      component.AddNewPatient();

      expect(dataService.setPatient).toHaveBeenCalledWith(jasmine.objectContaining({
        ID: 0,
        UserID: mockUser.ID,
        CreatedBy: mockUser.ID,
        ModifiedBy: mockUser.ID,
        IsActive: 1
      }));
    });

    it('should show error when no user is present', () => {
      dataService.getUser.and.returnValue(null);

      component.AddNewPatient();

      expect(messageService.info).toHaveBeenCalledWith('No user present. Create a new user first');
      expect(dataService.setPatient).not.toHaveBeenCalled();
    });
  });

  describe('Save Patient Information', () => {
    it('should create new patient successfully', () => {
      const newPatient = { ...mockPatient, ID: 0 };
      dataService.getPatient.and.returnValue(newPatient);
      patientService.createPatient.and.returnValue(of(mockPatient));

      component.SavePatientInformation();

      expect(patientService.createPatient).toHaveBeenCalledWith(newPatient);
      expect(messageService.success).toHaveBeenCalledWith('Patient information saved successfully');
      expect(dataService.setPatient).toHaveBeenCalledWith(mockPatient);
    });

    it('should update existing patient successfully', () => {
      patientService.updatePatient.and.returnValue(of(mockPatient));

      component.SavePatientInformation();

      expect(patientService.updatePatient).toHaveBeenCalledWith(mockPatient.ID, mockPatient);
      expect(messageService.success).toHaveBeenCalledWith('Patient information updated successfully');
      expect(dataService.setPatient).toHaveBeenCalledWith(mockPatient);
    });

    it('should show error when no patient information exists', () => {
      dataService.getPatient.and.returnValue(null);

      component.SavePatientInformation();

      expect(messageService.error).toHaveBeenCalledWith('No patient information to save');
      expect(patientService.createPatient).not.toHaveBeenCalled();
      expect(patientService.updatePatient).not.toHaveBeenCalled();
    });
  });
});
