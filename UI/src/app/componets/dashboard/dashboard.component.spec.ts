import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { PatientAppointmentService } from '../../services/patient-appointment.service';
import { PatientAppointment } from '../../models/patient-appointment.model';
import { DayPilot } from '@daypilot/daypilot-lite-angular';

// Mock SchedulerComponent
@Component({
  selector: 'app-scheduler',
  template: '<div>Mock Scheduler</div>'
})
class MockSchedulerComponent {
  addEvents(events: DayPilot.EventData[]): void {
    // Mock implementation
  }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let patientAppointmentService: jasmine.SpyObj<PatientAppointmentService>;

  const mockAppointments: PatientAppointment[] = [
    {
      ID: 1,
      PatientID: 1,
      DoctorID: 1,
      StartDateTime: new Date('2023-08-19T09:00:00Z'),
      EndDateTime: new Date('2023-08-19T10:00:00Z'),
      TreatmentName: 'Consultation',
      AppointmentStatus: 'Scheduled',
      Notes: 'Regular checkup',
      PatientName: 'John Doe',
      DoctorName: 'Dr. Smith',
      CreatedDate: '2023-08-18T00:00:00Z',
      ModifiedDate: '2023-08-18T00:00:00Z',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1
    },
    {
      ID: 2,
      PatientID: 2,
      DoctorID: 1,
      StartDateTime: new Date('2023-08-19T14:00:00Z'),
      EndDateTime: new Date('2023-08-19T15:00:00Z'),
      TreatmentName: 'Follow-up',
      AppointmentStatus: 'Scheduled',
      Notes: 'Post-surgery follow-up',
      PatientName: 'Jane Smith',
      DoctorName: 'Dr. Smith',
      CreatedDate: '2023-08-18T00:00:00Z',
      ModifiedDate: '2023-08-18T00:00:00Z',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1
    }
  ];

  beforeEach(async () => {
    const patientAppointmentServiceSpy = jasmine.createSpyObj('PatientAppointmentService', 
      ['getPatientAppointmentsByDoctorId']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      declarations: [MockSchedulerComponent],
      providers: [
        { provide: PatientAppointmentService, useValue: patientAppointmentServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    patientAppointmentService = TestBed.inject(PatientAppointmentService) as jasmine.SpyObj<PatientAppointmentService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty appointments array', () => {
    expect(component.appointments).toEqual([]);
  });

  it('should load appointments on init', () => {
    patientAppointmentService.getPatientAppointmentsByDoctorId.and.returnValue(of(mockAppointments));
    spyOn(component as any, 'addEventsToScheduler');

    component.ngOnInit();

    expect(patientAppointmentService.getPatientAppointmentsByDoctorId).toHaveBeenCalledWith(1);
    expect(component.appointments).toEqual(mockAppointments);
    expect((component as any).addEventsToScheduler).toHaveBeenCalledWith(mockAppointments);
  });

  it('should handle error when loading appointments', () => {
    spyOn(console, 'error');
    patientAppointmentService.getPatientAppointmentsByDoctorId.and.returnValue(throwError('Load error'));

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Error fetching appointments:', 'Load error');
  });

  it('should add events to scheduler', () => {
    // Create a mock scheduler component
    const mockScheduler = jasmine.createSpyObj('SchedulerComponent', ['addEvents']);
    component.scheduler = mockScheduler;

    // Call the private method through bracket notation
    (component as any).addEventsToScheduler(mockAppointments);

    const expectedEvents: DayPilot.EventData[] = [
      {
        id: '1',
        text: 'John Doe',
        start: new DayPilot.Date('2023-08-19T09:00:00Z'),
        end: new DayPilot.Date('2023-08-19T10:00:00Z'),
        resource: 'Dr. Smith',
        backColor: '#bc8f3cff'
      },
      {
        id: '2',
        text: 'Jane Smith',
        start: new DayPilot.Date('2023-08-19T14:00:00Z'),
        end: new DayPilot.Date('2023-08-19T15:00:00Z'),
        resource: 'Dr. Smith',
        backColor: '#bc8f3cff'
      }
    ];

    expect(mockScheduler.addEvents).toHaveBeenCalledWith(expectedEvents);
  });

  it('should handle appointment with unknown patient name', () => {
    const appointmentWithoutName: any = { ...mockAppointments[0], PatientName: undefined };
    const mockScheduler = jasmine.createSpyObj('SchedulerComponent', ['addEvents']);
    component.scheduler = mockScheduler;

    (component as any).addEventsToScheduler([appointmentWithoutName]);

    const expectedEvent = jasmine.objectContaining({
      text: 'Unknown Patient'
    });

    expect(mockScheduler.addEvents).toHaveBeenCalledWith(jasmine.arrayContaining([expectedEvent]));
  });

  it('should handle appointment with unknown doctor name', () => {
    const appointmentWithoutDoctor: any = { ...mockAppointments[0], DoctorName: undefined };
    const mockScheduler = jasmine.createSpyObj('SchedulerComponent', ['addEvents']);
    component.scheduler = mockScheduler;

    (component as any).addEventsToScheduler([appointmentWithoutDoctor]);

    const expectedEvent = jasmine.objectContaining({
      resource: 'General'
    });

    expect(mockScheduler.addEvents).toHaveBeenCalledWith(jasmine.arrayContaining([expectedEvent]));
  });
});
