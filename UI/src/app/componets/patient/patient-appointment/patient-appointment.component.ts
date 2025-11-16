import { Component, ViewChild, viewChild } from '@angular/core';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { map, Observable, Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { UtilityService } from '../../../services/utility.service';
import { User, UserType } from '../../../models/user.model';
import { SchedulerComponent } from "../../../common/scheduler/scheduler";
import { DayPilotModule, DayPilot } from '@daypilot/daypilot-lite-angular';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';
import { SearchModel } from '../../../models/search.model';
import { SearchService } from '../../../services/search.service';
import { TypeaheadComponent } from '../../../common/typeahead/typeahead';

@Component({
  selector: 'app-patient-appointment',
  imports: [SchedulerComponent, DayPilotModule, FormsModule,TypeaheadComponent],
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.css']
})
export class PatientAppointmentComponent {


  @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;

  patient: Patient | null = null;
  appointments: PatientAppointment[] | null = [];
  newAppointment: PatientAppointment = new PatientAppointment();
  newStartDateString: string;
  // Subscription to handle patient changes
  private patientSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService, private util: UtilityService, private searchService: SearchService) { }

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (_newPatient: Patient) => {
        this.patient = _newPatient;
        if (_newPatient && _newPatient.PatientAppointments && _newPatient.PatientAppointments.length > 0) {
          this.appointments = _newPatient.PatientAppointments;
        } else {
          this.appointments = [];
        }
        if (this.scheduler && this.appointments && this.appointments.length > 0) {
          this.AddEventsToScheduler(this.appointments);
          console.log('Events added to scheduler:');
          // Pass the appointments to the scheduler component

        }
        //console.log('Patient updated:', _newPatient);
      },
      error: (error) => {
        console.error('Error subscribing to patient changes:', error);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.patientSubscription) {
      this.patientSubscription.unsubscribe();
    }
  }

  AddEventsToScheduler(appointments: PatientAppointment[]) {
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

  EditAppointment(appointmentID: number) {
    const appointment = this.appointments.find(a => a.ID === appointmentID);
    if (appointment) {
      this.newAppointment = { ...appointment };
    }
  }

  DeleteAppointment(appointmentID: number) {
    this.appointments = this.appointments.filter(a => a.ID !== appointmentID);
    this.scheduler.deleteEvent(appointmentID.toString());
    this.patient.PatientAppointments = this.appointments;
    this.dataService.setPatient(this.patient);
  }

  SaveAppointment() {
    // Implement save logic here
    const appointmentTime = (document.getElementById('txtAppointmentTime') as HTMLInputElement)?.value;
    const appointmentEndTime = (document.getElementById('txtAppointmentEndTime') as HTMLInputElement)?.value;

    // Normalize StartDateTime / EndDateTime as Date first
    let baseStart = new Date(this.newAppointment.StartDateTime as any);
    if (appointmentTime) {
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      baseStart.setHours(hours, minutes, 0, 0);
    }

    let baseEnd = new Date(this.newAppointment.EndDateTime as any || baseStart);
    if (appointmentEndTime) {
      const [hours, minutes] = appointmentEndTime.split(':').map(Number);
      baseEnd.setHours(hours, minutes, 0, 0);
    }

    // Convert to local wall time strings (no timezone so DB keeps same clock time)
    this.newAppointment.StartDateTime = this.util.toLocalDateTimeString(baseStart) as any;
    this.newAppointment.EndDateTime = this.util.toLocalDateTimeString(baseEnd) as any;

    if (this.newAppointment.ID < 1) {
      this.appointments.push({ ...this.newAppointment });
    } else {
      const index = this.appointments.findIndex(a => a.ID === this.newAppointment.ID);
      if (index > -1) {
        this.appointments[index] = { ...this.newAppointment };
      }
    }
    this.AddEventsToScheduler(this.appointments);
    this.patient.PatientAppointments = this.appointments;
    this.dataService.setPatient(this.patient);
  }

  AddAppointment() {
    var user = this.dataService.getUser();
    this.newAppointment = new PatientAppointment();
    if(this.appointments.length > 0)
    {
      var tempID = Math.min(...this.appointments.map(a => a.ID)) - 1;
      if (tempID > 0 || tempID === null || tempID === undefined) tempID = 0; // Ensure ID is not negative
      this.newAppointment.ID = tempID;
    }
    else
    {
      this.newAppointment.ID = 0;
    }
    this.newAppointment.PatientID = this.patient?.ID || 1;
    this.newAppointment.UserID = user?.ID || 1;

    // Store as local wall time strings
    this.newAppointment.StartDateTime = new Date();
    this.newAppointment.EndDateTime = new Date();
    this.newStartDateString = this.util.formatDate(new Date());
    this.newAppointment.DoctorName = '';
    this.newAppointment.TreatmentName = '';
    this.newAppointment.PatientName = user?.FirstName + ' ' + user?.LastName || 'Unknown Patient';
    this.newAppointment.IsActive = 1;
    this.newAppointment.CreatedBy = user?.ID || 1;
    this.newAppointment.ModifiedBy = user?.ID || 1;
    this.newAppointment.CreatedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.newAppointment.ModifiedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.newAppointment.DoctorID = this.dataService.getLoginUser()?.user?.ID || 1;

     const now = this.util.roundToNearestInterval(new Date());
     const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

    this.newAppointment.StartTime =  now.toLocaleTimeString('en-GB').slice(0, 5);
    this.newAppointment.EndTime = thirtyMinutesLater.toLocaleTimeString('en-GB').slice(0, 5);;

   // document.getElementById('txtAppointmentTime')!.setAttribute('value', startTime);
   // document.getElementById('txtAppointmentEndTime')!.setAttribute('value', endTime);
  }

     getDoctors = (name: string): Observable<SearchModel[]> => {
        var searchModel: SearchModel = new  SearchModel(this.util);
        searchModel.UserType = UserType.Doctor;
        searchModel.FirstName = name;
        return this.searchService.Search(searchModel).pipe(map(result => result.Results as SearchModel[]));
     }

      displayName(d: any): string {
      if (!d) return 'Unknown Patient';
      const first = d.FirstName || '';
      const last = d.LastName || '';
      const name = (first + ' ' + last).trim();
      return name.length ? name : 'Unknown Patient';
   }

}