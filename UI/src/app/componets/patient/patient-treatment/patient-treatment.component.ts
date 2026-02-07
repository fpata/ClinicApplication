import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { DataService } from '../../../services/data.service';
import { UtilityService } from '../../../services/utility.service';
import { Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { PatientTreatmentDetail } from '../../../models/patient-treatment-detail.model';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-treatment',
  imports: [FormsModule],
  templateUrl: './patient-treatment.component.html',
  styleUrls: ['./patient-treatment.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientTreatmentComponent {



  patient: Patient | null = null;
  treatment: PatientTreatment | null = null;
  isEditOperation = false;
  newTreatmentDetail: PatientTreatmentDetail | null = null;
  // Subscription to handle patient changes
  private patientSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService, private util: UtilityService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (newPatient: Patient) => {
        this.patient = newPatient;
        if (newPatient && newPatient.PatientTreatment) {
          this.treatment = newPatient.PatientTreatment;
          this.newTreatmentDetail = null;
          console.log('Patient loaded with treatment:', this.treatment);
          console.log('Treatment details count:', this.treatment.PatientTreatmentDetails?.length || 0);
          this.cdr.markForCheck();
        }
        else {
          this.treatment = new PatientTreatment();
          if(this.patient) this.patient.PatientTreatment = this.treatment;
          console.log('New patient treatment initialized');
          this.cdr.markForCheck();
        }
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

  ClearTreatmentForm() {
    this.newTreatmentDetail = null;
    this.isEditOperation = false;
    this.cdr.markForCheck();
  }

  AddNewTreatmentDetails() {
    if (!this.treatment || !this.patient) {
      alert('Patient and treatment data must be loaded first.');
      console.error('Missing patient or treatment data');
      return;
    }

    this.newTreatmentDetail = new PatientTreatmentDetail();
    
    // Calculate ID for new treatment detail (use negative IDs for unsaved records)
    const ids = this.treatment?.PatientTreatmentDetails?.map(x => x.ID) || [];
    if (ids.length > 0) {
      let minVal = Math.min(...ids) - 1;
      this.newTreatmentDetail.ID = minVal > 0 ? 0 : minVal;
    }
    else {
      this.newTreatmentDetail.ID = 0;
    }
    
    this.newTreatmentDetail.IsActive = 1;
    // Set PatientTreatmentID - will be 0 for new patients, updated after save
    this.newTreatmentDetail.PatientTreatmentID = this.treatment.ID || 0;
    this.newTreatmentDetail.UserID = this.patient.UserID;
    this.newTreatmentDetail.PatientID = this.patient.ID || 0;
    this.newTreatmentDetail.Tooth = '';
    this.newTreatmentDetail.Procedure = '';
    this.newTreatmentDetail.Prescription = '';
    this.newTreatmentDetail.FollowUpInstructions = '';
    this.newTreatmentDetail.TreatmentDate = this.util.formatDate(new Date(), 'yyyy-MM-dd');
    this.newTreatmentDetail.CreatedBy = this.patient.UserID;
    this.newTreatmentDetail.CreatedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.newTreatmentDetail.ModifiedBy = this.patient.UserID;
    this.newTreatmentDetail.ModifiedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.newTreatmentDetail.ProcedureTreatmentCost = 0;
    this.isEditOperation = false;
    
    console.log('New treatment detail initialized:', this.newTreatmentDetail);
    this.cdr.markForCheck();
  }


  EditTreatmentDetails(treatmentdetailID: number) {
    if (this.treatment && this.treatment.PatientTreatmentDetails && this.treatment.PatientTreatmentDetails.length > 0) {
      const index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === treatmentdetailID);
      if (index > -1) {
        this.newTreatmentDetail = { ...this.treatment.PatientTreatmentDetails[index] };
        this.isEditOperation = true;
        this.cdr.markForCheck();
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
        this.treatment.ActualCost = this.calculateTotalCost();
        this.patient.PatientTreatment = this.treatment;
        this.dataService.setPatient(this.patient);
        this.cdr.markForCheck();
      } else {
        alert('Treatment detail not found.');
      }
    }
  }

  SaveTreatmentDetails() {
    if (!this.newTreatmentDetail) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate required fields
    if (!this.newTreatmentDetail.Tooth || this.newTreatmentDetail.Tooth.trim() === '') {
      alert('Please enter tooth number.');
      return;
    }

    if (!this.newTreatmentDetail.Procedure || this.newTreatmentDetail.Procedure.trim() === '') {
      alert('Please enter procedure.');
      return;
    }

    if (!this.newTreatmentDetail.TreatmentDate) {
      alert('Please select treatment date.');
      return;
    }

    // Ensure treatment has details array
    if (!this.treatment.PatientTreatmentDetails) {
      this.treatment.PatientTreatmentDetails = [];
    }

    if (this.newTreatmentDetail.ID < 1 && this.isEditOperation === false) {
      // Add new treatment detail - create a complete copy
      const newDetail = JSON.parse(JSON.stringify(this.newTreatmentDetail));
      this.treatment.PatientTreatmentDetails.push(newDetail);
      console.log('Added new treatment detail:', newDetail);
      console.log('Total treatment details now:', this.treatment.PatientTreatmentDetails.length);
    } else {
      // Update existing treatment detail
      const index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === this.newTreatmentDetail.ID);
      if (index > -1) {
        const updatedDetail = JSON.parse(JSON.stringify(this.newTreatmentDetail));
        this.treatment.PatientTreatmentDetails[index] = updatedDetail;
        console.log('Updated treatment detail at index:', index, updatedDetail);
      }
    }

    // Update actual cost
    this.treatment.ActualCost = this.calculateTotalCost();
    
    // Ensure patient reference is updated
    if (!this.patient) {
      console.error('Patient is null!');
      alert('Patient data is missing. Please reload and try again.');
      return;
    }
    
    // Create a new patient object to ensure change detection
    const updatedPatient = JSON.parse(JSON.stringify(this.patient));
    updatedPatient.PatientTreatment = this.treatment;
    
    console.log('Saving patient with treatment details:', updatedPatient.PatientTreatment);
    
    // Update data service
    this.dataService.setPatient(updatedPatient);
    
    this.newTreatmentDetail = null;
    this.isEditOperation = false;
    this.cdr.markForCheck();
    
    // Show confirmation
    alert('Treatment detail saved. Click the Save button in the main form to persist changes to the database.');
  }

  private calculateTotalCost(): number {
    let totalCost = 0;
    if (this.treatment.PatientTreatmentDetails && this.treatment.PatientTreatmentDetails.length > 0) {
      for (let detail of this.treatment.PatientTreatmentDetails) {
        totalCost += detail.ProcedureTreatmentCost || 0;
      }
    }
    return totalCost;
  }

  // Method to sync treatment details with server-generated IDs after patient save
  syncTreatmentDetailsWithServer(updatedPatient: Patient): void {
    if (updatedPatient && updatedPatient.PatientTreatment && updatedPatient.PatientTreatment.PatientTreatmentDetails) {
      // Update the treatment details with server-generated IDs
      this.treatment = updatedPatient.PatientTreatment;
      this.patient = updatedPatient;
      this.cdr.markForCheck();
    }
  }
}

