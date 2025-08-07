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

 private patientSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (patient:Patient) => {
        this.patient = patient;
        
      },
      error: (error:any) => {
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

}
