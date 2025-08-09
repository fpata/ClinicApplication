import { Component, ViewChild } from '@angular/core';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { SchedulerComponent } from "../../../common/scheduler/scheduler";
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { PatientAppointmentService } from '../../../services/patient-appointment.service';
import { PatientSearchModel } from '../../../models/patient-search.model';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-doctor-appointments',
  imports: [SchedulerComponent, FormsModule],
  templateUrl: './doctorappointments.html',
  styleUrl: './doctorappointments.css',
  providers: [ PatientAppointmentService, HttpClient]
})
export class DoctorAppointmentsComponent {
  clearSearchClicked: boolean;
  searchResult: PatientAppointment[];

  constructor(private patientAppointmentService: PatientAppointmentService) {
    this.clearSearchClicked = false;
    this.searchPatient = {
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
      EndDate: (new Date().toISOString().split('T')[0]), // Default to today
      StartDate: (new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Default to 365 days ago
    }
    this.searchResult = [];
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
      next: (result:any) => {
        this.searchResult = result;
        this.clearSearchClicked = false;
        if(!this.searchResult || this.searchResult.length === 0) {
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
clearSearch() {
throw new Error('Method not implemented.');
}
  @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;
  appointments: PatientAppointment[] | null = null;
  searchPatient: PatientSearchModel;
searchLengthConstraintError: any;



  EditAppointment(arg0: number) {
    throw new Error('Method not implemented.');
  }
  DeleteAppointment(arg0: number) {
    throw new Error('Method not implemented.');
  }
  SaveAppointment() {
    throw new Error('Method not implemented.');
  }
  
 AddEventsToScheduler(this: any, appointments: PatientAppointment[]) {
    var events: DayPilot.EventData[] = [];
    appointments.forEach(appointment => {
      events.push({
        id: appointment.ID.toString(),
        text: appointment.PatientName || 'Unknown Patient',
        start: new DayPilot.Date(appointment.StartApptDate),
        end: new DayPilot.Date(appointment.EndApptDate),
        resource: appointment.DoctorName || 'General',
        backColor: '#3c8dbc',
      });
    });
    this.scheduler.addEvents(events);
  }

  ngOnInit() {
    
  }
}
