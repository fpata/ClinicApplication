import { Component, viewChild, ViewChild } from '@angular/core';
import { PatientAppointmentComponent } from '../patient-appointment/patient-appointment';
import { PatientHistoryComponent } from '../patient-history/patient-history';
import { PatientReportComponent } from '../patient-report/patient-report';
import { PatientSearchComponent } from '../patient-search/patient-search';
import { PatientTreatmentComponent } from "../patient-treatment/patient-treatment";
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { UtilityService } from '../../../services/utility.service';
import { PatientCompleteHistoryComponent } from '../patientcompletehistory/patientcompletehistory';
import { Patient } from '../../../models/patient.model';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { PatientReport } from '../../../models/patient-report.model';
import { PatientQuickCreateComponent } from '../patient-quick-create/patient-quick-create.component';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-patient-master',
  standalone: true,
  templateUrl: './patient-master.html',
  styleUrl: './patient-master.css',
  imports: [PatientAppointmentComponent, PatientHistoryComponent, PatientReportComponent,
    PatientSearchComponent, PatientTreatmentComponent,
    PatientCompleteHistoryComponent, PatientQuickCreateComponent],
  providers: [HttpClient]
})
export class PatientMasterComponent {

  isSearchTabSelected: boolean = true;
  selectedTab: string = 'tbPatientSearch';
  userID: number = 0;
  @ViewChild(PatientCompleteHistoryComponent) patientCompleteHistoryComponent: PatientCompleteHistoryComponent;
  @ViewChild(PatientQuickCreateComponent) quickCreateComponent!: PatientQuickCreateComponent;
  constructor(private dataService: DataService, private patientService: PatientService, private util: UtilityService) { }

  tabSelectedEvent(event: MouseEvent) {
    // Logic to handle tab selection
    var targetId = (event.currentTarget as Element).id;
    if (targetId.startsWith('tbPatientSearch')) {
      this.isSearchTabSelected = true;
    } else {
      this.isSearchTabSelected = false;
    }
    if (targetId.startsWith('tbPreviousInfo')) {
      this.userID = this.dataService.getUser()?.ID;
      if (this.userID >= 0 && this.patientCompleteHistoryComponent) {
        this.patientCompleteHistoryComponent.GetAllTreatmentsForUser(this.userID);
      }
    }
    if (targetId.startsWith('tbQuickCreate')) {
      this.userID = this.dataService.getUser()?.ID;
      if (this.userID == undefined || this.userID == 0) {
        document.getElementById('tbPatientSearch-tab')?.click();
        return true; // Prevent default action if needed
      }
    }
    console.log('Selected Tab:', targetId);
    this.selectedTab = targetId;
    return true;
  }

  ClearPatientInformation() {
    this.dataService.setPatient(null);
    this.dataService.setUser(null);
    this.patientCompleteHistoryComponent.patientTreatments = [];
    this.userID = 0;
  }

  DeletePatientInformation() {
    const currentPatient = this.dataService.getPatient();

    if (!currentPatient || !currentPatient.ID) {
      alert('No patient selected for deletion');
      return;
    }

    // Get patient name from the associated user
    const patientName = currentPatient.user ?
      `${currentPatient.user.FirstName} ${currentPatient.user.LastName}` :
      `Patient ID: ${currentPatient.ID}`;

    if (confirm(`Are you sure you want to delete patient: ${patientName}?`)) {
      this.patientService.deletePatient(currentPatient.ID).subscribe({
        next: () => {
          alert('Patient deleted successfully');
          this.ClearPatientInformation(); // Clear the patient from data service
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          alert('Error occurred while deleting patient. Please try again.');
        }
      });
    }
  }

  AddNewPatient() {
    var patient: Patient = new Patient();
    patient.UserID = this.dataService.getUser()?.ID || 0;
    patient.ID = 0; // New patient, so ID is 0
    patient.CreatedBy = this.dataService.getUser()?.ID || 0;
    patient.ModifiedBy = this.dataService.getUser()?.ID || 0;
  patient.CreatedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-dd HH:mm:ss');
  patient.ModifiedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-dd HH:mm:ss');
    patient.IsActive = 1;
    patient.PatientAppointments = new Array<PatientAppointment>();
    patient.PatientAppointments = [];
    patient.PatientTreatment = new PatientTreatment();
    patient.PatientReports = new Array<PatientReport>();
    this.dataService.setPatient(patient);
  }

  SavePatientInformation() {
    var currentPatient = this.dataService.getPatient();
    if (this.selectedTab.startsWith('tbQuickCreate')) {
      currentPatient = this.quickCreateComponent.patient;
      currentPatient.UserID = this.dataService.getUser()?.ID || 0;
      currentPatient.PatientTreatment.UserID = this.dataService.getUser()?.ID || 0;
    }

    if (!currentPatient) {
      alert('No patient information to save');
      return;
    }

    // Validate required fields
    if (!currentPatient.UserID) {
      alert('User ID is required');
      return;
    }

    // Determine if this is a new patient or existing patient
    const isNewPatient = !currentPatient.ID || currentPatient.ID === 0;

    if (isNewPatient) {
      // Create new patient
      this.patientService.createPatient(currentPatient).subscribe({
        next: (savedPatient) => {
          alert('Patient information saved successfully');
          // Update the patient in data service with the returned patient (which includes the new ID)
          this.dataService.setPatient(savedPatient);
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          alert('Error occurred while saving patient information. Please try again.');
        }
      });
    } else {
      // Update existing patient
      this.patientService.updatePatient(currentPatient.ID, currentPatient).subscribe({
        next: (updatedPatient) => {
          alert('Patient information updated successfully');
          // Update the patient in data service with the returned updated patient
          this.dataService.setPatient(updatedPatient);
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          alert('Error occurred while updating patient information. Please try again.');
        }
      });
    }
  }


}
