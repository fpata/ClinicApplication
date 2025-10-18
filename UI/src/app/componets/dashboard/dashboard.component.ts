import { Component, OnInit, ViewChild } from '@angular/core';
import { SchedulerComponent } from "../../common/scheduler/scheduler";
import { AppointmentSearchResponse, PatientAppointment } from '../../models/patient-appointment.model';
import { PatientAppointmentService } from '../../services/patient-appointment.service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { PagingComponent } from "../../common/paging/paging.component";
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { PatientSearchModel } from '../../models/patient-search.model';
import { MessageService } from '../../services/message.service';
import { UtilityService } from '../../services/utility.service';
import { UserType } from '../../models/user.model';
import { Observable } from 'rxjs';
import { TypeaheadComponent } from '../../common/typeahead/typeahead';
import { LoginResponse } from '../../services/login.service';

@Component({
   selector: 'app-dashboard',
   imports: [SchedulerComponent, PagingComponent, FormsModule, TypeaheadComponent],
   templateUrl: './dashboard.component.html',
   styleUrls: ['./dashboard.component.css'],
   providers: []
})
export class DashboardComponent implements OnInit {


   currentPage: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;
   newAppointment: PatientAppointment | null = null;
   appointments: PatientAppointment[] = [];
   doctors: PatientSearchModel[] | null = null;


   @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;

   constructor(private patientAppointmentService: PatientAppointmentService,
      private dataService: DataService,
      private searchService: SearchService,
      private messageService: MessageService,
      private util: UtilityService
   ) {

   }

   ngOnInit(): void {
      this.pageSize = this.dataService.getConfig()?.pageSize || 10;
      this.loadAppointments();
   }

   onPageChange($event: number) {
      this.currentPage = $event;
      this.loadAppointments();
   }

   private loadAppointments(): void {
      this.patientAppointmentService.getPatientAppointmentsByDoctorId(1)
         .subscribe({
            next: (results: AppointmentSearchResponse) => {
               if (results == null ||  results.PatientAppointments == null || results.PatientAppointments.length === 0) {
                  this.messageService.info('No appointments found.');
                  this.appointments = [];
                  this.totalItems = 0;
               }
               else {
                  this.messageService.success('Appointments loaded successfully.');
                  this.appointments = results.PatientAppointments;
                  this.totalItems = results.TotalCount;
                  this.addEventsToScheduler(this.appointments);
               }
            },
            error: (error) => {
               console.error('Error fetching appointments:', error);
               this.messageService.error('Error fetching appointments:', error);
            }
         });
   }

   private addEventsToScheduler(appointments: PatientAppointment[]): void {
      if (appointments == null || appointments === undefined || appointments.length === 0 ) {
         return;
      }
      const events: DayPilot.EventData[] = appointments.map(appointment => ({
         id: appointment.ID.toString(),
         text: appointment.PatientName || 'Unknown Patient',
         start: new DayPilot.Date(appointment.StartDateTime),
         end: new DayPilot.Date(appointment.EndDateTime),
         resource: appointment.DoctorName || 'General',
         backColor: '#bc8f3cff'
      }));
      this.scheduler.addEvents(events);
   }

   SaveAppointment() {

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

      this.patientAppointmentService.createPatientAppointment(appointmentToSave)
         .subscribe({
            next: (result) => {
               this.messageService.success('Appointment saved successfully.');
               if (this.appointments == null || this.appointments === undefined) {
                  this.appointments = [];
               }
               this.appointments.push(result);
               this.addEventsToScheduler(this.appointments);
            },
            error: (error) => {
               this.messageService.error('Error saving appointment:');
               console.error('Error saving appointment:', error);
            }
         });
   }


   getDoctors = (name: string): Observable<PatientSearchModel[]> => {
      var searchModel: PatientSearchModel = new PatientSearchModel(this.util);
      searchModel.UserType = UserType.Doctor;
      searchModel.FirstName = name;
      return this.searchService.searchUser(searchModel);
   }

   getPatients = (name: string): Observable<PatientSearchModel[]> => {
      const searchModel: PatientSearchModel = new PatientSearchModel(this.util);
      searchModel.UserType = UserType.Patient;
      searchModel.FirstName = name;
      return this.searchService.searchUser(searchModel);
   }


   displayName(d: any): string {
      if (!d) return 'Unknown Patient';
      const first = d.FirstName || '';
      const last = d.LastName || '';
      const name = (first + ' ' + last).trim();
      return name.length ? name : 'Unknown Patient';
   }

   InitializeNewAppointment() {
      var loginUser: LoginResponse = this.dataService.getLoginUser()
      this.newAppointment = new PatientAppointment();
      this.newAppointment.ID = 0;
      this.newAppointment.StartDateTime = this.util.formatDate(new Date()) as any;
      this.newAppointment.EndDateTime = this.util.formatDate(new Date()) as any;
      this.newAppointment.CreatedDate = this.util.formatDateTime(new Date());
      this.newAppointment.ModifiedDate = this.util.formatDateTime(new Date());
      this.newAppointment.CreatedBy = loginUser?.user?.ID || 1;
      this.newAppointment.ModifiedBy = loginUser?.user?.ID || 1;
      document.getElementById('txtAppointmentTime')!.setAttribute('value', new Date().toTimeString().slice(0, 5));
      const thirtyMinutesLater = new Date(new Date().getTime() + 30 * 60000);
      document.getElementById('txtAppointmentEndTime')!.setAttribute('value', thirtyMinutesLater.toTimeString().slice(0, 5));
      if (loginUser?.user?.UserType === UserType.Doctor) {
         this.newAppointment.DoctorID = loginUser.user?.ID || 0;
         this.newAppointment.DoctorName = loginUser.user?.FirstName || '';
      }
   }
}