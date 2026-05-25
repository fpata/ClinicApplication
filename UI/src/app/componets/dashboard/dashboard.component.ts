import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SchedulerComponent } from "../../common/scheduler/scheduler";
import { AppointmentSearchResponse, PatientAppointment } from '../../models/patient-appointment.model';
import { PatientAppointmentService } from '../../services/patient-appointment.service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { PagingComponent } from "../../common/paging/paging.component";
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { SearchModel, SearchResultModel } from '../../models/search.model';
import { MessageService } from '../../services/message.service';
import { UtilityService } from '../../services/utility.service';
import { UserType } from '../../models/user.model';
import { map, Observable } from 'rxjs';
import { TypeaheadComponent } from '../../common/typeahead/typeahead';
import { LoginResponse } from '../../services/login.service';
import { DatePipe } from '@angular/common';
@Component({
   selector: 'app-dashboard',
   imports: [SchedulerComponent, PagingComponent, FormsModule, TypeaheadComponent, DatePipe],
   templateUrl: './dashboard.component.html',
   styleUrls: ['./dashboard.component.css'],
   providers: [],
   standalone: true,
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {



   currentPage: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;
   newAppointment: PatientAppointment | null = null;
   appointments: PatientAppointment[] = [];
   selectedPatient: any | null = null;
   selectedDoctor: any | null = null;
   doctors: SearchModel[] | null = null;
   newStartDateString: string = '';
   private readonly eventColors = ['#88bddb', '#a0d4bd', '#8a6d69', '#70624c', '#bc9fc7', '#8295a8'];

   @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;

   constructor(private patientAppointmentService: PatientAppointmentService,
      private dataService: DataService,
      private searchService: SearchService,
      private messageService: MessageService,
      private util: UtilityService,
      private cdr: ChangeDetectorRef
   ) {

   }

   ngOnInit(): void {
      this.pageSize = this.dataService.getConfig()?.pageSize || 10;
      this.loadAppointments(DayPilot?.Date?.today()?.firstDayOfWeek(1).toDate(), DayPilot?.Date?.today()?.firstDayOfWeek(1).addDays(6).toDate());
   }

   onPageChange($event: number) {
      this.currentPage = $event;
      this.loadAppointments(DayPilot?.Date?.today()?.firstDayOfWeek(1).toDate(), DayPilot?.Date?.today()?.firstDayOfWeek(1).addDays(6).toDate());
   }

   private loadAppointments(startDate: Date, endDate: Date): void {

      this.patientAppointmentService.getAllAppointments(startDate, endDate, this.currentPage, this.pageSize)
         .subscribe({
            next: (results: AppointmentSearchResponse) => {
               if (results == null || results.PatientAppointments == null || results.PatientAppointments.length === 0) {
                  this.messageService.info('No appointments found.');
                  this.appointments = [];
                  this.totalItems = 0;
                  this.cdr.detectChanges();
               }
               else {
                  // this.messageService.success('Appointments loaded successfully.');
                  this.appointments = this.patientAppointmentService.setPatinetAppointmentTime(results.PatientAppointments);
                  this.totalItems = results.TotalCount;
                  this.addEventsToScheduler(this.appointments);
                  this.cdr.detectChanges();
               }
            },
            error: (error) => {
               console.error('Error fetching appointments:', error);
               this.messageService.error('Error fetching appointments:', error);
               this.appointments = [];
               this.totalItems = 0;
               this.cdr.detectChanges();
            }
         });
   }

   private addEventsToScheduler(appointments: PatientAppointment[]): void {
      if (appointments == null || appointments === undefined || appointments.length === 0) {
         return;
      }
      const events: DayPilot.EventData[] = appointments.map(appointment => ({
         id: appointment.ID.toString(),
         text: appointment.PatientName + " : " + appointment.TreatmentName|| 'Unknown Patient',
         start: new DayPilot.Date(appointment.StartDateTime),
         end: new DayPilot.Date(appointment.EndDateTime),
         resource: appointment.DoctorName || 'General',
         backColor: this.getRandomColor()
      }));
      if (this.scheduler) this.scheduler.addEvents(events);
   }

   SaveAppointment() {
      // Create a temporary appointment object
      const appointmentToSave = { ...this.newAppointment };
      
      // Build StartDateTime from the date string and start time
      if (this.newStartDateString && this.newAppointment?.StartTime) {
         appointmentToSave.StartDateTime = this.util.createAppointmentDateTimeFromString(
            this.newStartDateString,
            this.newAppointment.StartTime
         );
      }

      // Build EndDateTime from the date string and end time
      if (this.newStartDateString && this.newAppointment?.EndTime) {
         appointmentToSave.EndDateTime = this.util.createAppointmentDateTimeFromString(
            this.newStartDateString,
            this.newAppointment.EndTime
         );
      }

      const appointmentPayload: any = {
         ...appointmentToSave,
         StartDateTime: appointmentToSave.StartDateTime ? this.util.toLocalDateTimeString(appointmentToSave.StartDateTime) : undefined,
         EndDateTime: appointmentToSave.EndDateTime ? this.util.toLocalDateTimeString(appointmentToSave.EndDateTime) : undefined
      };

      appointmentToSave.AppointmentStatus = 'Scheduled';
      appointmentToSave.IsActive = 1;
      if (appointmentToSave.ID && appointmentToSave.ID > 0) {
         // Update existing appointment
         this.patientAppointmentService.updatePatientAppointment(appointmentToSave.ID, appointmentPayload)
            .subscribe({
               next: (result) => {
                  this.messageService.success('Appointment updated successfully.');
                  const index = this.appointments.findIndex(a => a.ID === result.ID);
                  if (index > -1) {
                     this.appointments[index] = result;
                  }
                  // Refresh scheduler events so the calendar shows the updated appointment
                  this.addEventsToScheduler(this.appointments);
                   // If the global user state contains this patient, update it so other components refresh
                  try {
                     const user: any = this.dataService.getUser();
                     if (user && user.Patients && user.Patients.length) {
                        const patient: any = user.Patients.find((p: any) => p.ID === result.PatientID);
                        if (patient) {
                           if (!patient.PatientAppointments) patient.PatientAppointments = [];
                           const pIndex = patient.PatientAppointments.findIndex((a: any) => a.ID === result.ID);
                           if (pIndex > -1) {
                              patient.PatientAppointments[pIndex] = result;
                           } else {
                              patient.PatientAppointments.push(result);
                           }
                           this.dataService.setUser(user);
                        }
                     }
                  } catch (e) {
                     // ignore if no global user
                  }
                   this.cdr.detectChanges();
               },
               error: (error) => {
                  this.messageService.error('Error updating appointment:');
                  console.error('Error updating appointment:', error);
               }
            });
      } else {
         // Continue with saving...
         this.patientAppointmentService.createPatientAppointment(appointmentPayload)
            .subscribe({
               next: (result) => {
                  this.messageService.success('Appointment saved successfully.');
                  if (this.appointments == null || this.appointments === undefined) {
                     this.appointments = [];
                  }
                  this.appointments.push(result);
                  this.totalItems = this.appointments.length;
                  this.addEventsToScheduler(this.appointments);
                  // Update global user/patient appointments if present
                  try {
                     const user: any = this.dataService.getUser();
                     if (user && user.Patients && user.Patients.length) {
                        const patient: any = user.Patients.find((p: any) => p.ID === result.PatientID);
                        if (patient) {
                           if (!patient.PatientAppointments) patient.PatientAppointments = [];
                           patient.PatientAppointments.push(result);
                           this.dataService.setUser(user);
                        }
                     }
                  } catch (e) {
                     // ignore
                  }
                  this.cdr.detectChanges();
               },
               error: (error) => {
                  this.messageService.error('Error saving appointment:');
                  console.error('Error saving appointment:', error);
                  this.cdr.detectChanges();
               }
            });
      }
   }


   getDoctors = (name: string): Observable<SearchModel[]> => {
      var searchModel: SearchModel = new SearchModel(this.util);
      searchModel.UserType = UserType.Doctor;
      searchModel.FirstName = name;
      return this.searchService.SearchUser(searchModel).pipe(map(result => result.Results as SearchModel[]));
   }

   onPatientSelected(patient: any | null) {
      if (!this.newAppointment) return;
      this.selectedPatient = patient;
      if (!patient) {
         this.newAppointment.PatientID = 0;
         this.newAppointment.PatientName = '';
         this.newAppointment.UserID = 0;
         return;
      }
      this.newAppointment.PatientID = patient.PatientID ?? patient.UserID ?? 0;
      this.newAppointment.PatientName = `${patient.FirstName || ''} ${patient.LastName || ''}`.trim();
      this.newAppointment.UserID = patient.UserID ?? this.newAppointment.UserID ?? 0;
   }

   onDoctorSelected(doctor: any | null) {
      if (!this.newAppointment) return;
      this.selectedDoctor = doctor;
      if (!doctor) {
         this.newAppointment.DoctorID = 0;
         this.newAppointment.DoctorName = '';
         return;
      }
      this.newAppointment.DoctorID = doctor.UserID ?? 0;
      this.newAppointment.DoctorName = `${doctor.FirstName || ''} ${doctor.LastName || ''}`.trim();
   }

   getPatients = (name: string): Observable<SearchModel[]> => {
      const searchModel: SearchModel = new SearchModel(this.util);
      searchModel.UserType = UserType.Patient;
      searchModel.FirstName = name;
      return this.searchService.SearchPatient(searchModel).pipe(map(result => result.Results as SearchModel[]));
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
      this.newStartDateString = now.toISOString().split('T')[0];
      // Format times for display
      const startTime = now.toLocaleTimeString('en-GB').slice(0, 5);
      const endTime = thirtyMinutesLater.toLocaleTimeString('en-GB').slice(0, 5);
      this.newAppointment.StartTime = startTime;
      this.newAppointment.EndTime = endTime;


      this.selectedPatient = null;
      this.selectedDoctor = null;

      if (loginUser?.user?.UserType === UserType.Doctor) {
         this.newAppointment.DoctorID = loginUser.user?.ID || 0;
         this.newAppointment.DoctorName = loginUser.user?.FirstName + ' ' + loginUser.user?.LastName;
         this.selectedDoctor = {
            UserID: loginUser.user?.ID,
            FirstName: loginUser.user?.FirstName,
            LastName: loginUser.user?.LastName
         };
      }
      this.cdr.detectChanges();
   }

   NavigationChange($event: { action: string; date: DayPilot.Date; }) {
      let startDate: Date;
      let endDate: Date;

      switch ($event.action) {
         case 'today':
         case 'previous-week':
         case 'next-week':
         case 'week':
            startDate = $event.date.firstDayOfWeek(1).toDate();
            endDate = $event.date.firstDayOfWeek(1).addDays(6).toDate();
            break;
         case 'previous-day':
         case 'next-day':
         case 'day':
            startDate = $event.date.toDate();
            endDate = $event.date.addHours(23).toDate();
            break;
         default:
            startDate = $event.date.toDate();
            endDate = $event.date.addDays(6).toDate();
      }

      // Reset page to 1 when navigation changes
      this.currentPage = 1;
      this.loadAppointments(startDate, endDate);
   }

   onTimeRangeSelectedEvent($event: any) {
      document.getElementById('btnAddNewAppointment')!.click();
      this.newAppointment!.StartDateTime = $event.startDateTime.toDate();
      this.newAppointment!.EndDateTime = $event.endDateTime.toDate();
      // Set date and time strings for the modal inputs
      this.newStartDateString = this.util.format(this.newAppointment!.StartDateTime, 'yyyy-MM-dd');
      this.newAppointment!.StartTime = this.util.format(this.newAppointment!.StartDateTime, 'HH:mm');
      this.newAppointment!.EndTime = this.util.format(this.newAppointment!.EndDateTime, 'HH:mm');
      document.getElementById('appointmentDatePicker')!.setAttribute('value', this.util.formatAppointmentDateTime(this.newAppointment!.StartDateTime));
      this.cdr.detectChanges();
      // document.getElementById('txtAppointmentTime')!.setAttribute('value', this.newAppointment!.StartDateTime.getHours().toString().padStart(2, '0') + ':' + this.newAppointment!.StartDateTime.getMinutes().toString().padStart(2, '0'));
      //document.getElementById('txtAppointmentEndTime')!.setAttribute('value', this.newAppointment!.EndDateTime.getHours().toString().padStart(2, '0') + ':' + this.newAppointment!.EndDateTime.getMinutes().toString().padStart(2, '0'));
   }

   onStartTimeChanged(newTime: string) {
      if (!this.newAppointment) return;
      this.newAppointment.StartTime = newTime;

      // Update StartDateTime based on current selected date
      if (this.newStartDateString) {
         this.newAppointment.StartDateTime = this.util.createAppointmentDateTimeFromString(this.newStartDateString, newTime);
      } else if (this.newAppointment.StartDateTime) {
         this.newAppointment.StartDateTime = this.util.createAppointmentDateTime(this.newAppointment.StartDateTime, newTime);
      }

      // Ensure EndTime is after StartTime; default to +30 minutes if not
      const start = new Date(this.newAppointment.StartDateTime as any);
      let end: Date;
      if (this.newAppointment.EndTime) {
         end = this.util.createAppointmentDateTimeFromString(this.newStartDateString || this.util.format(this.newAppointment.StartDateTime, 'yyyy-MM-dd'), this.newAppointment.EndTime);
         if (end <= start) {
            end = new Date(start.getTime() + 30 * 60000);
            this.newAppointment.EndTime = this.util.format(end, 'HH:mm');
         }
      } else {
         end = new Date(start.getTime() + 30 * 60000);
         this.newAppointment.EndTime = this.util.format(end, 'HH:mm');
      }
      this.newAppointment.EndDateTime = end;
      this.cdr.detectChanges();
   }

   onEndTimeChanged(newTime: string) {
      if (!this.newAppointment) return;
      this.newAppointment.EndTime = newTime;

      if (this.newStartDateString) {
         this.newAppointment.EndDateTime = this.util.createAppointmentDateTimeFromString(this.newStartDateString, newTime);
      } else if (this.newAppointment.EndDateTime) {
         this.newAppointment.EndDateTime = this.util.createAppointmentDateTime(this.newAppointment.EndDateTime, newTime);
      }

      // If end is before or equal to start, push end to start + 30m
      const start = new Date(this.newAppointment.StartDateTime as any);
      const end = new Date(this.newAppointment.EndDateTime as any);
      if (end <= start) {
         const corrected = new Date(start.getTime() + 30 * 60000);
         this.newAppointment.EndDateTime = corrected;
         this.newAppointment.EndTime = this.util.format(corrected, 'HH:mm');
      }
      this.cdr.detectChanges();
   }

   onAppointmentDateChanged(newDate: string) {
      if (!newDate || !this.newAppointment) return;

      this.newStartDateString = newDate;

      // Update StartDateTime with the new date
      if (this.newAppointment.StartTime) {
         this.newAppointment.StartDateTime = this.util.createAppointmentDateTimeFromString(
            newDate,
            this.newAppointment.StartTime
         );
      } else {
         // If no time is set, set to midnight on the new date
         this.newAppointment.StartDateTime = new Date(newDate);
      }

      // Update EndDateTime with the new date
      if (this.newAppointment.EndTime) {
         this.newAppointment.EndDateTime = this.util.createAppointmentDateTimeFromString(
            newDate,
            this.newAppointment.EndTime
         );
      } else {
         // If no end time is set, set to 30 minutes after start time
         this.newAppointment.EndDateTime = new Date(this.newAppointment.StartDateTime.getTime() + 30 * 60000);
      }

      this.cdr.detectChanges();
   }

   private getRandomColor(): string {
      return this.eventColors[Math.floor(Math.random() * this.eventColors.length)];
   }

   EditAppointment(appointmentID: number) {
      const appointment = this.appointments.find(a => a.ID === appointmentID);
      if (appointment) {
         this.newAppointment = { ...appointment };
         this.newStartDateString = this.util.formatDate(appointment.StartDateTime, 'yyyy-MM-dd');
         this.selectedPatient = {
            PatientID: appointment.PatientID,
            UserID: appointment.UserID,
            FirstName: appointment.PatientName?.split(' ')[0] || '',
            LastName: appointment.PatientName?.split(' ').slice(1).join(' ') || ''
         };
         this.selectedDoctor = {
            UserID: appointment.DoctorID,
            FirstName: appointment.DoctorName?.split(' ')[0] || '',
            LastName: appointment.DoctorName?.split(' ').slice(1).join(' ') || ''
         };
      }
   }

   DeleteAppointment(appointmentID: number) {
      const msg = 'Are you sure you want to delete this appointment?';
      const confirmFn = (window as any).showConfirm || ((m: string) => Promise.resolve(confirm(m)));
      confirmFn(msg).then((confirmed: boolean) => {
         if (!confirmed) return;
         const index = this.appointments.findIndex(x => x.ID === appointmentID);
         if (index === -1) {
            this.messageService.error('Appointment not found.');
            return;
         }

         this.patientAppointmentService.deletePatientAppointment(appointmentID).subscribe({
            next: () => {
               this.appointments.splice(index, 1);
               this.totalItems = this.appointments.length;
               try {
                  this.scheduler.removeEventById(appointmentID.toString());
               } catch (e) {
                  // ignore scheduler delete failures
               }
               this.messageService.success('Appointment deleted successfully.');
               this.cdr.detectChanges();
            },
            error: (error) => {
               this.messageService.error('Error deleting appointment:');
               console.error('Error deleting appointment:', error);
            }
         });
      });
   }

}
