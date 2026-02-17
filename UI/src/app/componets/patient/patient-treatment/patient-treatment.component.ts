import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { UtilityService } from '../../../services/utility.service';
import { Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { PatientTreatmentDetail } from '../../../models/patient-treatment-detail.model';
import { Patient } from '../../../models/patient.model';
import { PatientHeaderComponent } from '../patient-header/patient-header.component';
import { MessageService } from '../../../services/message.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-patient-treatment',
  imports: [FormsModule, PatientHeaderComponent],
  templateUrl: './patient-treatment.component.html',
  styleUrls: ['./patient-treatment.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientTreatmentComponent implements OnInit, OnDestroy {
  user: User | null = null;
  patient: Patient | null = null;
  treatment: PatientTreatment | null = null;
  patientId: number | null = null;
  isNewPatient = false;
  isEditOperation = false;
  newTreatmentDetail: PatientTreatmentDetail | null = null;
  // Subscription to handle patient changes
  private patientSubscription: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private patientService: PatientService,
    private util: UtilityService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // Get patient ID from route
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId')) || null;
    
    if (this.patientId === null) {
      console.error('Patient ID is required');
      this.router.navigate(['/patient/search']);
      return;
    }

    this.isNewPatient = this.patientId === 0;

    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.user$.subscribe({
      next: (_user: User) => {
        this.user = _user;
        this.patient = _user.Patients[0] as Patient; // Assuming the user has a Patient array and we want the first one
        if (this.patient && this.patient.PatientTreatment) {
          this.treatment = this.patient.PatientTreatment;
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
      // ensure data service is updated with server-saved patient
      this.cdr.markForCheck();
    }
  }

  // Method to save patient and handle redirect for new patients
  SavePatientAndRedirect(): void {
    if (!this.patient) {
      alert('No patient data to save');
      return;
    }

    // If this is a new patient (ID is 0), save it first
    if (this.isNewPatient && this.patientId === 0) {
      this.patientService.createPatient(this.patient).subscribe({
        next: (savedPatient: Patient) => {
          console.log('New patient created successfully:', savedPatient);
          this.messageService.success('New patient created successfully');

          // Navigate to the new patient ID
          this.router.navigate(['/patient', savedPatient.ID, 'treatment']);
        },
        error: (error) => {
          console.error('Error saving new patient:', error);
          alert('Failed to save patient. Please try again.');
        }
      });
    } else {
      // For existing patients, update
      if (this.patient.ID && this.patient.ID > 0) {
        this.patientService.updatePatient(this.patient.ID, this.patient).subscribe({
          next: (updatedPatient: Patient) => {
            console.log('Patient updated successfully:', updatedPatient);
            this.messageService.success('Patient information saved successfully');
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error updating patient:', error);
            this.messageService.error('Failed to update patient. Please try again.');
          }
        });
      }
    }
  }
}

