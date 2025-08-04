import { Component, ViewChild, viewChild } from '@angular/core';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/user.model';
import { SchedulerComponent } from "../../../common/scheduler/scheduler";
import { DayPilot } from '@daypilot/daypilot-lite-angular';

@Component({
  selector: 'app-patient-appointment',
  imports: [SchedulerComponent],
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
  user: User | null = null;
  appointments: PatientAppointment[] | null = null;

  // Subscription to handle user changes
  private userSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService) { }

  ngOnInit() {
    // Subscribe to user changes from the data service
    this.userSubscription = this.dataService.user$.subscribe({
      next: (user) => {
        this.user = user;
        if (this.user && this.user.Patients && this.user.Patients.length > 0 && this.user.Patients[0].PatientAppointments && this.user.Patients[0].PatientAppointments.length > 0) 
        this.appointments = this.user.Patients[0].PatientAppointments;
        if (this.scheduler && this.appointments) {
          this.AddEventsToScheduler(this.appointments);
          console.log('Events added to scheduler:');
          // Pass the appointments to the scheduler component

        }
        console.log('User updated:', user);
      },
      error: (error) => {
        console.error('Error subscribing to user changes:', error);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  AddEventsToScheduler(this: any, appointments: PatientAppointment[]) {
    var events: DayPilot.Event[] = [];
    appointments.forEach(appointment => {
      events.push(new DayPilot.Event({
        id: appointment.ID.toString(),
        text: appointment.PatientName || 'Unknown Patient',
        start: new DayPilot.Date(appointment.StartApptDate),
        end: new DayPilot.Date(appointment.EndApptDate),
        resource: appointment.DoctorName || 'General',
        backColor: '#3c8dbc',
      }));
    });
    this.scheduler.addEvents(events);
  }

}