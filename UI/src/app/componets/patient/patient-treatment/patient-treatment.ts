import { Component } from '@angular/core';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { DataService } from '../../../services/data.service';
import { Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { PatientTreatmentDetail } from '../../../models/patient-treatment-detail.model';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-treatment',
  imports: [FormsModule],
  templateUrl: './patient-treatment.html',
  styleUrl: './patient-treatment.css'
})
export class PatientTreatmentComponent {

  patient: Patient | null = null;
  treatment: PatientTreatment | null = null;
  isModalOpen = false;
  editingTreatmentId: number | null = null;
  originalTreatmentData: any = null;

  // Subscription to handle patient changes
  private patientSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService) { }

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (newPatient: Patient) => {
        this.patient = newPatient;
        if (newPatient && newPatient.PatientTreatment) {
          this.treatment = newPatient.PatientTreatment;
        }

        console.log('Patient updated:', this.patient);
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


  EditTreatmentDetails(treatmentdetailID: number) {
    if (this.treatment && this.treatment.PatientTreatmentDetails && this.treatment.PatientTreatmentDetails.length > 0) {
      const index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === treatmentdetailID);
      if (index > -1) {
        const treatmentDetail: PatientTreatmentDetail = this.treatment.PatientTreatmentDetails[index];
        (document.getElementById('txtTooth') as HTMLInputElement).value = treatmentDetail.Tooth;
        (document.getElementById('txtProcedure') as HTMLInputElement).value = treatmentDetail.Procedure;
        (document.getElementById('txtAdvice') as HTMLInputElement).value = treatmentDetail.Advice;
        //(document.getElementById('txtTreatmentDate') as HTMLInputElement).value = treatmentDetail.TreatmentDate;
        //(document.getElementById('hdtreatmentid') as HTMLInputElement).value = treatmentDetail.PatientTreatmentID.toString();
        (document.getElementById('hdtreatmentdetailid') as HTMLInputElement).value = treatmentDetail.ID.toString();
      } else {
        alert('Treatment detail not found.');
      }
    }
  }

  DeleteTreatmentDetails(treatmentdetailID: number) {
    if (confirm('Are you sure you want to delete this treatment detail?')) {
      var index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === treatmentdetailID);
      if (index > -1) {
        this.treatment.PatientTreatmentDetails.splice(index, 1);
        alert('Treatment detail deleted successfully.');
      } else {
        alert('Treatment detail not found.');
      }
    }
  }

  SaveTreatmentDetails() {
    if (this.treatment) {
      // Save the treatment details
      console.log('Saving treatment details:', this.treatment);
      alert('Treatment details saved successfully.');
    } else {
      alert('No treatment details to save.');
    }
  }
}

