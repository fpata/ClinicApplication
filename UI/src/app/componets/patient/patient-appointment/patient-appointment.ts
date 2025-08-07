import { Component, ViewChild, viewChild } from '@angular/core';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/user.model';
import { SchedulerComponent } from "../../../common/scheduler/scheduler";
import { DayPilotModule, DayPilot } from '@daypilot/daypilot-lite-angular';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-appointment',
  imports: [SchedulerComponent, DayPilotModule],
  templateUrl: './patient-appointment.html',
  styleUrl: './patient-appointment.css'
})
export class PatientAppointmentComponent {
  @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;

  EditAppointment(arg0: number) {
    throw new Error('Method not implemented.');
  }
  DeleteAppointment(arg0: number) {
    throw new Error('Method not implemented.');
  }
  SaveAppointment() {
    throw new Error('Method not implemented.');
  }
  patient: Patient | null = null;
  appointments: PatientAppointment[] | null = null;

  // Subscription to handle patient changes
  private patientSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService) { }

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (_newPatient: Patient) => {
        this.patient = _newPatient;
        if (_newPatient && _newPatient.PatientAppointments && _newPatient.PatientAppointments.length > 0) {
          this.appointments = _newPatient.PatientAppointments;
        }
        if (this.scheduler && this.appointments) {
          this.AddEventsToScheduler(this.appointments);
          console.log('Events added to scheduler:');
          // Pass the appointments to the scheduler component

        }
        console.log('Patient updated:', _newPatient);
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
        start: new DayPilot.Date(appointment.StartApptDate),
        end: new DayPilot.Date(appointment.EndApptDate),
        resource: appointment.DoctorName || 'General',
        backColor: '#3c8dbc', 
      });
    });
    this.scheduler.addEvents(events);

  }

}