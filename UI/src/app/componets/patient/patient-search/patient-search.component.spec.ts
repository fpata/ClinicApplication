import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PatientSearchComponent } from './patient-search.component';
import { SearchService } from '../../../services/search.service';
import { PatientService } from '../../../services/patient.service';
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { UtilityService } from '../../../services/utility.service';
import { PatientSearchModel } from '../../../models/patient-search.model';
import { User, UserType, Gender } from '../../../models/user.model';
import { Patient } from '../../../models/patient.model';

describe('PatientSearchComponent', () => {
  let component: PatientSearchComponent;
  let fixture: ComponentFixture<PatientSearchComponent>;
  let searchService: jasmine.SpyObj<SearchService>;
  let patientService: jasmine.SpyObj<PatientService>;
  let dataService: jasmine.SpyObj<DataService>;
  let userService: jasmine.SpyObj<UserService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let router: jasmine.SpyObj<Router>;

  const mockPatientSearchResults: PatientSearchModel[] = [
    {
      PatientID: 1,
      UserID: 1,
      FirstName: 'John',
      LastName: 'Doe',
      UserName: 'johndoe',
      UserType: 1,
      PrimaryEmail: 'john.doe@email.com',
      PrimaryPhone: '1234567890',
      PermCity: 'New York',
      StartDate: '2023-08-01',
      EndDate: '2023-08-19'
    } as PatientSearchModel,
    {
      PatientID: 2,
      UserID: 2,
      FirstName: 'Jane',
      LastName: 'Smith',
      UserName: 'janesmith',
      UserType: 1,
      PrimaryEmail: 'jane.smith@email.com',
      PrimaryPhone: '0987654321',
      PermCity: 'Los Angeles',
      StartDate: '2023-08-01',
      EndDate: '2023-08-19'
    } as PatientSearchModel
  ];

  const mockUser: User = {
    ID: 1,
    FirstName: 'John',
    LastName: 'Doe',
    UserName: 'johndoe',
    UserType: UserType.Patient,
    Gender: Gender.Male,
    DateOfBirth: '1985-05-15',
    Age: 38,
    FullName: 'John Doe',
    CreatedDate: '2023-01-01T00:00:00Z',
    ModifiedDate: '2023-08-19T00:00:00Z',
    CreatedBy: 1,
    ModifiedBy: 1,
    IsActive: 1
  };

  const mockPatient: Patient = {
    ID: 1,
    UserID: 1,
    Allergies: 'Peanuts, Shellfish',
    Medications: 'Aspirin 81mg daily',
    FatherMedicalHistory: 'Diabetes',
    MotherMedicalHistory: 'Hypertension',
    PersonalMedicalHistory: 'No significant history',
    InsuranceProvider: 'Blue Cross',
    InsurancePolicyNumber: 'BC123456789',
    Height: 175,
    Weight: 70,
    CreatedDate: '2023-01-01T00:00:00Z',
    ModifiedDate: '2023-08-19T00:00:00Z',
    CreatedBy: 1,
    ModifiedBy: 1,
    IsActive: 1
  };

  const mockCompletePatient = {
    ...mockUser,
    Patients: [mockPatient]
  };

  beforeEach(async () => {
    const searchServiceSpy = jasmine.createSpyObj('SearchService', ['searchUser']);
    const patientServiceSpy = jasmine.createSpyObj('PatientService', ['getCompletePatient']);
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['setUser', 'setPatient']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['formatDate']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    utilityServiceSpy.formatDate.and.callFake((date: Date, format: string) => {
      return date.toISOString().split('T')[0]; // Simple date formatting
    });

    await TestBed.configureTestingModule({
      imports: [PatientSearchComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: UtilityService, useValue: utilityServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientSearchComponent);
    component = fixture.componentInstance;
    searchService = TestBed.inject(SearchService) as jasmine.SpyObj<SearchService>;
    patientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default date range', () => {
    expect(component.searchPatient).toBeDefined();
    expect(component.searchResult).toEqual([]);
    expect(component.searchLengthConstraintError).toBeFalse();
    expect(component.clearSearchClicked).toBeFalse();
  });

  it('should validate search input and set error when all fields are too short', () => {
    component.searchPatient.FirstName = 'Jo';
    component.searchPatient.LastName = 'Do';
    component.searchPatient.PrimaryEmail = 'j@';
    component.searchPatient.PermCity = 'NY';
    component.searchPatient.PrimaryPhone = '12';

    component.validateSearchInput();

    expect(component.searchLengthConstraintError).toBeTrue();
    expect(component.clearSearchClicked).toBeFalse();
  });

  it('should validate search input and clear error when at least one field is valid', () => {
    component.searchPatient.FirstName = 'John';
    component.searchPatient.LastName = 'Do';

    component.validateSearchInput();

    expect(component.searchLengthConstraintError).toBeFalse();
    expect(component.clearSearchClicked).toBeTrue();
  });

  it('should search patients successfully', () => {
    searchService.searchUser.and.returnValue(of(mockPatientSearchResults));
    component.searchLengthConstraintError = false;

    component.SearchPatient();

    expect(searchService.searchUser).toHaveBeenCalledWith(component.searchPatient);
    expect(component.searchResult).toEqual(mockPatientSearchResults);
    expect(component.clearSearchClicked).toBeFalse();
  });

  it('should handle search error', () => {
    spyOn(window, 'alert');
    spyOn(console, 'error');
    searchService.searchUser.and.returnValue(throwError('Search failed'));
    component.searchLengthConstraintError = false;

    component.SearchPatient();

    expect(window.alert).toHaveBeenCalledWith('Error occurred while searching for patients.');
    expect(console.error).toHaveBeenCalled();
    expect(component.searchResult).toEqual([]);
    expect(component.clearSearchClicked).toBeFalse();
  });

  it('should not search when length constraint error exists', () => {
    component.searchLengthConstraintError = true;

    component.SearchPatient();

    expect(searchService.searchUser).not.toHaveBeenCalled();
  });

  it('should clear search fields and results', () => {
    component.searchPatient.FirstName = 'John';
    component.searchPatient.LastName = 'Doe';
    component.searchPatient.PatientID = 1;
    component.searchResult = mockPatientSearchResults;

    component.clearSearch();

    expect(component.searchLengthConstraintError).toBeFalse();
    expect(component.searchPatient.FirstName).toBe('');
    expect(component.searchPatient.LastName).toBe('');
    expect(component.searchPatient.PatientID).toBe(0);
    expect(component.searchResult).toEqual([]);
    expect(component.clearSearchClicked).toBeTrue();
  });

  it('should handle patient click with valid patient ID', () => {
    patientService.getCompletePatient.and.returnValue(of(mockCompletePatient));
    spyOn(console, 'log');

    component.OnPatientIdClick(1, 1);

    expect(patientService.getCompletePatient).toHaveBeenCalledWith(1);
    expect(console.log).toHaveBeenCalledWith('User data:', mockCompletePatient);
    expect(dataService.setUser).toHaveBeenCalledWith(mockCompletePatient);
    expect(dataService.setPatient).toHaveBeenCalledWith(mockPatient);
  });

  it('should handle patient click with zero patient ID', () => {
    userService.getUser.and.returnValue(of(mockUser));

    component.OnPatientIdClick(0, 1);

    expect(userService.getUser).toHaveBeenCalledWith(1);
    expect(dataService.setUser).toHaveBeenCalledWith(mockUser);
  });

  it('should handle error when fetching complete patient', () => {
    spyOn(console, 'error');
    patientService.getCompletePatient.and.returnValue(throwError('Patient fetch failed'));

    component.OnPatientIdClick(1, 1);

    expect(console.error).toHaveBeenCalledWith('Error fetching patient data:', 'Patient fetch failed');
  });

  it('should handle error when fetching user', () => {
    spyOn(console, 'error');
    userService.getUser.and.returnValue(throwError('User fetch failed'));

    component.OnPatientIdClick(0, 1);

    expect(console.error).toHaveBeenCalledWith('Error fetching user data:', 'User fetch failed');
  });

  it('should navigate to new user page', () => {
    component.AddNewUser();

    expect(router.navigate).toHaveBeenCalledWith(['/user', 'new']);
  });
});
