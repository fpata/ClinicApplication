import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';
import { PatientVitals } from '../../../models/patient-vitals.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-vitals',
  imports: [FormsModule],
  templateUrl: './patient-vitals.html',
  styleUrl: './patient-vitals.css'
})
export class PatientVitalsComponent {

vitals: PatientVitals;
patient: Patient;
patientSubscription: Subscription;

constructor(private dataService: DataService) {
 }

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
