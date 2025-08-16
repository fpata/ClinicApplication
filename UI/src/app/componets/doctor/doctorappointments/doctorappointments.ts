import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { SchedulerComponent } from "../../../common/scheduler/scheduler";
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { PatientAppointmentService } from '../../../services/patient-appointment.service';
import { PatientSearchModel } from '../../../models/patient-search.model';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../../services/data.service';
import { SearchService } from '../../../services/search.service';
import { TypeaheadComponent } from '../../../common/typeahead/typeahead';
import { Observable } from 'rxjs';
import { MessagesComponent } from '../../../common/messages/messages.component';
import { MessageService } from '../../../services/message.service';
import { UtilityService } from '../../../services/utility.service';

@Component({
  selector: 'app-doctor-appointments',
  imports: [SchedulerComponent, FormsModule, TypeaheadComponent],
  templateUrl: './doctorappointments.html',
  styleUrl: './doctorappointments.css',
  providers: [HttpClient]
})
export class DoctorAppointmentsComponent {

  clearSearchClicked: boolean;
  searchResult: PatientAppointment[];
  @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;
  appointments: PatientAppointment[] | null = null;
  searchPatient: PatientSearchModel;
  searchLengthConstraintError: any;
  newAppointment: PatientAppointment = new PatientAppointment();
  doctors: PatientSearchModel[] | null = null;

  constructor(private patientAppointmentService: PatientAppointmentService, 
    private dataService: DataService,
    private searchService: SearchService,
    private messageService: MessageService,
    private util: UtilityService
  ) {
    this.clearNewAppointment();
    this.appointments = new Array<PatientAppointment>();
    this.appointments = [];
  }

  // Placeholder methods for the unimplemented methods
  validateSearchInput() {
    if (this.searchPatient != null && this.searchPatient != undefined && this.searchPatient.FirstName?.length < 3 && this.searchPatient.LastName?.length < 3 &&
      this.searchPatient.PrimaryEmail?.length < 3 && this.searchPatient.PermCity?.length < 3 &&
      this.searchPatient.PrimaryPhone?.length < 3 && this.searchPatient.DoctorName?.length < 3) {
      this.searchLengthConstraintError = true;
      this.clearSearchClicked = false;
    } else {
      this.searchLengthConstraintError = false;
      this.clearSearchClicked = true;
    }
  }
  SearchAppointments() {
    if (this.searchLengthConstraintError) {
      return;
    }
    this.patientAppointmentService.searchAppointmentsForDoctor(this.searchPatient).subscribe({
      next: (result: any) => {
        this.searchResult = result;
        this.clearSearchClicked = false;
        if (!this.searchResult || this.searchResult.length === 0) {
          alert('No appointments found.');
        } else {
          this.AddEventsToScheduler(this.searchResult);
        }
      },
      error: (err: any) => {
        // Optionally handle error
        alert('Error occurred while searching for patients.');
        console.error(err);
        this.searchResult = [];
        this.clearSearchClicked = false;
      }
    });
  }

  getDoctors() :void {
    var searchModel:PatientSearchModel = new PatientSearchModel(this.util);
    searchModel.UserType = 'Doctor';
    this.searchService.searchUser(searchModel).subscribe({
      next: (result: PatientSearchModel[]) => {
        this.doctors = result;
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.error('Error occurred while fetching doctors.');
        this.doctors = [];
      }
    });
  }

  getPatients = (name:string): Observable<PatientSearchModel[]> => {
    const searchModel:PatientSearchModel = new PatientSearchModel(this.util);
    searchModel.UserType = 'Patient';
    searchModel.FirstName = name;
    return this.searchService.searchUser(searchModel);
  }

  clearSearch() {
    this.searchPatient = <PatientSearchModel> {
      PatientID: 0,
      UserID: 0,
      FirstName: '',
      LastName: '',
      PrimaryPhone: '',
      PrimaryEmail: '',
      PermCity: '',
      UserName: '',
      UserType: '',
      DoctorID: 0,
      DoctorName: '',
  EndDate: this.util.formatDate(new Date()),
  StartDate: this.util.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))    
    };
    this.searchResult = [];
    this.clearSearchClicked = false;
  }

  AddNewAppointment() {
    this.getDoctors();
    this.clearNewAppointment();
  }

  EditAppointment(arg0: number) {
    throw new Error('Method not implemented.');
  }
  DeleteAppointment(arg0: number) {
    throw new Error('Method not implemented.');
  }
  SaveAppointment() {
    // Implement save logic here
    const appointmentTime = (document.getElementById('txtAppointmentTime') as HTMLInputElement)?.value;
    const appointmentEndTime = (document.getElementById('txtAppointmentEndTime') as HTMLInputElement)?.value;

    // Create a temporary appointment object to avoid mutating the form-bound newAppointment
    const appointmentToSave = { ...this.newAppointment };

    if (appointmentToSave.StartDateTime && appointmentTime) {
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startDate = new Date(appointmentToSave.StartDateTime);
      startDate.setHours(hours, minutes, 0, 0);
      appointmentToSave.StartDateTime = startDate;
    }

    if (appointmentToSave.EndDateTime && appointmentEndTime) {
      const [hours, minutes] = appointmentEndTime.split(':').map(Number);
      // Assuming EndDateTime should be on the same day as StartDateTime
      const endDate = new Date(appointmentToSave.StartDateTime);
      endDate.setHours(hours, minutes, 0, 0);
      appointmentToSave.EndDateTime = endDate;
    }

    if (appointmentToSave.ID < 1) {
      appointmentToSave.ID = this.appointments.length > 0 ? Math.min(...this.appointments.map(a => a.ID)) - 1 : 0; // Initialize new appointment ID
      if (!this.appointments) this.appointments = [];
      this.appointments.push(appointmentToSave);

    } else {
      const index = this.appointments.findIndex(a => a.ID === appointmentToSave.ID);
      if (index > -1) {
        this.appointments[index] = appointmentToSave;
      }
    }
    // Defer the scheduler update to avoid blocking the UI thread
    setTimeout(() => this.AddEventsToScheduler(this.appointments));

    // Call API with the populated appointment BEFORE clearing the form
    this.patientAppointmentService.createPatientAppointment(appointmentToSave).subscribe({
      next: (result: any) => {
        // Replace the temp (possibly negative ID) with server result if needed
        if (appointmentToSave.ID < 0) {
          const idx = this.appointments.findIndex(a => a.ID === appointmentToSave.ID);
          if (idx > -1) {
            this.appointments[idx] = result;
          } else {
            this.appointments.push(result);
          }
        } else {
          this.appointments.push(result);
        }
        this.clearNewAppointment(); // Reset only after successful save
      },
      error: (err: any) => {
        console.error(err);
        // Keep the form values so user can retry
      }
    });
  }

  clearNewAppointment() {
  const today = new Date();
  const todayString = this.util.formatDate(today);
    const thirtyMinutesLater = new Date(today.getTime() + 30 * 60000);

    this.newAppointment = <PatientAppointment>{
      ID: 0,
      PatientID: 0,
      DoctorID: 0,
      StartDateTime: todayString as any, // Format for date input
      EndDateTime: todayString as any, // Format for date input
      TreatmentName: '',
  CreatedDate: this.util.formatDateTime(new Date()),
  ModifiedDate: this.util.formatDateTime(new Date()),
      CreatedBy: this.dataService.getLoginUser()?.user?.ID || 1,
      ModifiedBy: this.dataService.getLoginUser()?.user?.ID || 1
    };

    // Set default time values for time inputs
    const startTime = today.toTimeString().slice(0, 5);
    const endTime = thirtyMinutesLater.toTimeString().slice(0, 5);

    setTimeout(() => {
      const timeInput = document.getElementById('txtAppointmentTime') as HTMLInputElement;
      if (timeInput) timeInput.value = startTime;
      const endTimeInput = document.getElementById('txtAppointmentEndTime') as HTMLInputElement;
      if (endTimeInput) endTimeInput.value = endTime;
    });
  }

  AddEventsToScheduler(this: any, appointments: PatientAppointment[]) {
    var events: DayPilot.EventData[] = [];
    appointments.forEach(appointment => {
      events.push({
        id: appointment.ID.toString(),
        text: appointment.PatientName || 'Unknown Patient',
        start: new DayPilot.Date(appointment.StartDateTime),
        end: new DayPilot.Date(appointment.EndDateTime),
        resource: appointment.DoctorName || 'General',
        backColor: '#3c8dbc',
      });
    });
    this.scheduler.addEvents(events);
  }

  ngOnInit() {
    this.clearSearch();
  }

  displayPatientName(d: any): string {
  if (!d) return 'Unknown Patient';
  const first = d.FirstName || '';
  const last = d.LastName || '';
  const name = (first + ' ' + last).trim();
  return name.length ? name : 'Unknown Patient';
}
}
