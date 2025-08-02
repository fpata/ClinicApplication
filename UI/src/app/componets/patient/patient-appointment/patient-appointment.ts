import { Component } from '@angular/core';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-patient-appointment',
  imports: [],
  templateUrl: './patient-appointment.html',
  styleUrl: './patient-appointment.css'
})
export class PatientAppointmentComponent {
  
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
        this.appointments = this.user.Patients[0].PatientAppointments;

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
}
