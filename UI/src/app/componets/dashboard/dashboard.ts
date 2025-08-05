import { Component, ViewChild } from '@angular/core';
import { SchedulerComponent } from "../../common/scheduler/scheduler";
import { PatientAppointment } from '../../models/patient-appointment.model';
import { PatientAppointmentService } from '../../services/patient-appointment.service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';

@Component({
   selector: 'app-dashboard',
   imports: [SchedulerComponent],
   templateUrl: './dashboard.html',
   styleUrl: './dashboard.css'
})
export class Dashboard {
   appointments: PatientAppointment[] = [];
   @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;
   constructor(private patientAppointmentService: PatientAppointmentService) { }

   ngOnInit() {
      // Initialize appointments or fetch from a service if needed
      this.patientAppointmentService.getPatientAppointmentsByDoctorId(1)
         .subscribe({
            next: (appointments: PatientAppointment[]) => {
               this.appointments = appointments;
               this.AddEventsToScheduler(appointments);
            },
            error: (error: any) => {
               console.error('Error fetching appointments:', error);
            }
         });
   }

   AddEventsToScheduler(this: any, appointments: PatientAppointment[]) {
      //var events: DayPilot.EventData[] = [];
      const events: DayPilot.EventData[] = appointments.map(appointment => ({
         id: appointment.ID.toString(),
         text: appointment.PatientName || 'Unknown Patient',
         start: new DayPilot.Date(appointment.StartApptDate),
         end: new DayPilot.Date(appointment.EndApptDate),
         resource: appointment.DoctorName || 'General',
         backColor: '#bc8f3cff'
      }));
      this.scheduler.addEvents(events);
   }
}
