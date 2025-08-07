import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-patientcompletehistory',
  imports: [FormsModule],
  templateUrl: './patientcompletehistory.html',
  styleUrl: './patientcompletehistory.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PatientCompleteHistoryComponent {

  constructor(private dataService: DataService,
    private patientTreatmentService: PatientTreatmentService, private patientService: PatientService,
    private cdr: ChangeDetectorRef) { }

  patientTreatments: PatientTreatment[] = [];

  OnPatientIdClick(patientID: number) {
    this.patientService.getPatient(patientID).subscribe({
      next: (patient: Patient) => {
        this.dataService.setPatient(patient);
      },
      error: (error: any) => {
        console.error('Error fetching patient:', error);
      }
    });
  }

  GetAllTreatmentsForUser(userId: number) {
    this.patientTreatmentService.getAllTreatmentsForUser(userId).subscribe({
      next: (result: any) => {
        this.patientTreatments = result;
        this.cdr.markForCheck();
        console.log('Treatments fetched successfully:', this.patientTreatments);
      },
      error: (error: any) => {
        console.error('Error fetching treatments:', error);
      }
    });
  }
}