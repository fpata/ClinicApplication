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
      this.loadAppointments(DayPilot?.Date?.today()?.firstDayOfWeek(1).toDate(), DayPilot?.Date?.today()?.firstDayOfWeek(1).addDays(6).toDate());
   }

   onPageChange($event: number) {
      this.currentPage = $event;
      // this.loadAppointments(DayPilot?.Date?.today()?.firstDayOfWeek(1).toDate(), DayPilot?.Date?.today()?.firstDayOfWeek(1).addDays(6).toDate());
   }

   private loadAppointments(startDate: Date, endDate: Date): void {

      this.patientAppointmentService.getAllAppointments(startDate, endDate, this.currentPage, this.pageSize)
         .subscribe({
            next: (results: AppointmentSearchResponse) => {
               if (results == null || results.PatientAppointments == null || results.PatientAppointments.length === 0) {
                  this.messageService.info('No appointments found.');
                  this.appointments = [];
                  this.totalItems = 0;
               }
               else {
                  // this.messageService.success('Appointments loaded successfully.');
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
      if (appointments == null || appointments === undefined || appointments.length === 0) {
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

      // Create a temporary appointment object
      const appointmentToSave = { ...this.newAppointment };

      if (appointmentToSave.StartDateTime && appointmentTime) {
          appointmentToSave.StartDateTime = this.util.createAppointmentDateTime(
              appointmentToSave.StartDateTime,
              appointmentTime
          );
      }

      if (appointmentToSave.EndDateTime && appointmentEndTime) {
          appointmentToSave.EndDateTime = this.util.createAppointmentDateTime(
              appointmentToSave.StartDateTime,
              appointmentEndTime
          );
      }

      console.log('Start DateTime:', this.util.formatAppointmentDateTime(appointmentToSave.StartDateTime));
      console.log('End DateTime:', this.util.formatAppointmentDateTime(appointmentToSave.EndDateTime));

      appointmentToSave.AppointmentStatus = 'Scheduled';
      appointmentToSave.IsActive = 1;

      // Continue with saving...
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
      const loginUser: LoginResponse = this.dataService.getLoginUser();
      this.newAppointment = new PatientAppointment();
      
      // Round current time to nearest 30-minute interval
      const now = this.util.roundToNearestInterval(new Date());
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
      
      this.newAppointment.ID = 0;
      this.newAppointment.StartDateTime = now;
      this.newAppointment.EndDateTime = thirtyMinutesLater;
      this.newAppointment.CreatedDate = now.toISOString();
      this.newAppointment.ModifiedDate = now.toISOString();
      this.newAppointment.CreatedBy = loginUser?.user?.ID || 1;
      this.newAppointment.ModifiedBy = loginUser?.user?.ID || 1;
      this.newAppointment.IsActive = 1;
      this.newAppointment.AppointmentStatus = 'Scheduled';

      // Format times for display
      const startTime = now.toLocaleTimeString('en-GB').slice(0, 5);
      const endTime = thirtyMinutesLater.toLocaleTimeString('en-GB').slice(0, 5);
      
      document.getElementById('txtAppointmentTime')!.setAttribute('value', startTime);
      document.getElementById('txtAppointmentEndTime')!.setAttribute('value', endTime);

      if (loginUser?.user?.UserType === UserType.Doctor) {
          this.newAppointment.DoctorID = loginUser.user?.ID || 0;
          this.newAppointment.DoctorName = loginUser.user?.FirstName + ' ' + loginUser.user?.LastName;
      }
   }

   NavigationChange($event: { action: string; date: DayPilot.Date; }) {
       let startDate: Date;
       let endDate: Date;
   
       switch ($event.action) {
           case 'today':
           case 'previous-week':
           case 'next-week':
               startDate = $event.date.firstDayOfWeek(1).toDate();
               endDate = $event.date.firstDayOfWeek(1).addDays(6).toDate();
               break;
           case 'previous-day':
           case 'next-day':
               startDate = $event.date.toDate();
               endDate = $event.date.toDate();
               break;
           default:
               startDate = $event.date.toDate();
               endDate = $event.date.addDays(6).toDate();
       }
   
       // Reset page to 1 when navigation changes
       this.currentPage = 1;
       this.loadAppointments(startDate, endDate);
   }
}
