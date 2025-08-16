import { Component, OnInit, ViewChild } from '@angular/core';
import { SchedulerComponent } from "../../common/scheduler/scheduler";
import { PatientAppointment } from '../../models/patient-appointment.model';
import { PatientAppointmentService } from '../../services/patient-appointment.service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';

@Component({
   selector: 'app-dashboard',
   imports: [SchedulerComponent],
   templateUrl: './dashboard.html',
   styleUrl: './dashboard.css',
   providers: []
})
export class Dashboard implements OnInit {
   appointments: PatientAppointment[] = [];
   @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;

   constructor(private patientAppointmentService: PatientAppointmentService) { }

   ngOnInit(): void {
      this.loadAppointments();
   }

   private loadAppointments(): void {
      this.patientAppointmentService.getPatientAppointmentsByDoctorId(1)
         .subscribe({
            next: (appointments: PatientAppointment[]) => {
               this.appointments = appointments;
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
