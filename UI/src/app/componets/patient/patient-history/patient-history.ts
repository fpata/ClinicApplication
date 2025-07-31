import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../../models/patient.model';
import { User } from '../../../models/user.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-patient-history',
  imports: [FormsModule],
  templateUrl: './patient-history.html',
  styleUrl: './patient-history.css'
})
export class PatientHistoryComponent {
patient: Patient; // Assuming patient is defined and has the necessary properties
user:User | null = null; // Assuming user is defined and has the necessary properties
 private userSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Subscribe to user changes from the data service
    this.userSubscription = this.dataService.user$.subscribe({
      next: (user) => {
        this.user = user;
        this.patient = this.user.Patients ? this.user.Patients[0]:null; // Assuming the first patient is the one we want to display
        
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
