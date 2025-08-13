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
  isEditOperation = false;
  newTreatmentDetail: PatientTreatmentDetail | null = null;
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

  AddNewTreatmentDetails() {
    this.newTreatmentDetail = new PatientTreatmentDetail();
    const ids = this.treatment?.PatientTreatmentDetails?.map(x => x.ID) || [];
    this.newTreatmentDetail.ID = ids.length > 0 ? Math.min(...ids) - 1 : 0;
    this.newTreatmentDetail.IsActive = 1;
    this.newTreatmentDetail.PatientTreatmentID = this.treatment.ID;
    this.newTreatmentDetail.UserID = this.patient.UserID;
    this.newTreatmentDetail.PatientID = this.patient.ID;
    this.newTreatmentDetail.Tooth = '';
    this.newTreatmentDetail.Procedure = '';
    this.newTreatmentDetail.Advice = '';
    this.newTreatmentDetail.TreatmentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    this.newTreatmentDetail.CreatedBy = this.patient.UserID;
    this.newTreatmentDetail.CreatedDate = new Date().toISOString();
    this.newTreatmentDetail.ModifiedBy = this.patient.UserID;
    this.newTreatmentDetail.ModifiedDate = new Date().toISOString();
    this.isEditOperation = false;
  }


  EditTreatmentDetails(treatmentdetailID: number) {
    if (this.treatment && this.treatment.PatientTreatmentDetails && this.treatment.PatientTreatmentDetails.length > 0) {
      const index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === treatmentdetailID);
      if (index > -1) {
        this.newTreatmentDetail = { ...this.treatment.PatientTreatmentDetails[index] };
      } else {
        alert('Treatment detail not found.');
      }
    }
    this.isEditOperation = true
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
    if (this.newTreatmentDetail) {
      if (this.newTreatmentDetail.ID < 1 && this.isEditOperation === false) {
        // Add new treatment detail
        this.treatment.PatientTreatmentDetails.push({ ...this.newTreatmentDetail });
      } else {
        // Update existing treatment detail
        const index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === this.newTreatmentDetail.ID);
        if (index > -1) {
          this.treatment.PatientTreatmentDetails[index] = { ...this.newTreatmentDetail };
        }
      }
      this.patient.PatientTreatment = this.treatment;
      this.newTreatmentDetail = null;
      this.dataService.setPatient(this.patient);
      this.isEditOperation = false;
    } else {
      alert('Please fill in all required fields.');
    }
  }
}

