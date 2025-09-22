import { Component, OnInit, ViewChild } from '@angular/core';
import { SchedulerComponent } from "../../common/scheduler/scheduler";
import { PatientAppointment } from '../../models/patient-appointment.model';
import { PatientAppointmentService } from '../../services/patient-appointment.service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { PagingComponent } from "../../common/paging/paging.component";

@Component({
   selector: 'app-dashboard',
   imports: [SchedulerComponent, PagingComponent],
   templateUrl: './dashboard.component.html',
   styleUrls: ['./dashboard.component.css'],
   providers: []
})
export class DashboardComponent implements OnInit {
   currentPage: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;

   appointments: PatientAppointment[] = [];
   @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;

   constructor(private patientAppointmentService: PatientAppointmentService) { }

   ngOnInit(): void {
      this.loadAppointments();
   }

   onPageChange($event: number) {
      this.currentPage = $event;
      this.loadAppointments();
   }

   private loadAppointments(): void {
      this.patientAppointmentService.getPatientAppointmentsByDoctorId(1)
         .subscribe({
            next: (appointments: PatientAppointment[]) => {
               this.appointments = appointments;
               this.totalItems = 100; // Replace with actual total from backend if available
               this.addEventsToScheduler(appointments);
            },
            error: (error) => {
               console.error('Error fetching appointments:', error);
            }
         });
   }

   private addEventsToScheduler(appointments: PatientAppointment[]): void {
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
}
