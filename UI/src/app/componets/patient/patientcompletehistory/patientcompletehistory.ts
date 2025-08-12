import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { User } from '../../../models/user.model';
@Component({
  selector: 'app-patientcompletehistory',
  imports: [FormsModule],
  templateUrl: './patientcompletehistory.html',
  styleUrl: './patientcompletehistory.css',
  standalone: true
})

export class PatientCompleteHistoryComponent {

  constructor(private dataService: DataService,
    private patientTreatmentService: PatientTreatmentService, private patientService: PatientService
) { }

  patientTreatments: PatientTreatment[] = [];

  OnPatientIdClick(patientID: number) {
    this.patientService.getPatient(patientID).subscribe({
      next: (_newPatient: Patient) => {
        var user: User = this.dataService.getUser();
        user.Patients[0] = _newPatient;
        this.dataService.setUser(user);
        this.dataService.setPatient(_newPatient);
      },
      error: (error: any) => {
        console.error('Error fetching patient:', error);
      }
    });
  }

  GetAllTreatmentsForUser(userId: number) {
    this.patientTreatments = [];  
    this.patientTreatmentService.getAllTreatmentsForUser(userId).subscribe({
      next: (result: any) => {
        this.patientTreatments = result;
        console.log('Treatments fetched successfully:', this.patientTreatments);
      },
      error: (error: any) => {
        console.error('Error fetching treatments:', error);
      }
    });
  }
}