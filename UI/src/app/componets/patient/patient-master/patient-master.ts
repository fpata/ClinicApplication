import { Component, ViewChild } from '@angular/core';
import { PatientAppointmentComponent } from '../patient-appointment/patient-appointment';
import { PatientHistoryComponent } from '../patient-history/patient-history';
import { PatientReportComponent } from '../patient-report/patient-report';
import { PatientSearchComponent } from '../patient-search/patient-search';
import { PatientTreatmentComponent } from "../patient-treatment/patient-treatment";
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { PatientCompleteHistoryComponent } from '../patientcompletehistory/patientcompletehistory';
import { Patient } from '../../../models/patient.model';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { PatientReport } from '../../../models/patient-report.model';
import {PatientQuickCreateComponent} from '../patient-quick-create/patient-quick-create.component';
@Component({
  selector: 'app-patient-master',
  templateUrl: './patient-master.html',
  styleUrl: './patient-master.css',
  imports: [PatientAppointmentComponent, PatientHistoryComponent, PatientReportComponent,
     PatientSearchComponent, PatientTreatmentComponent, 
    PatientCompleteHistoryComponent, PatientQuickCreateComponent]
})
export class PatientMasterComponent {

  isSearchTabSelected: boolean = true;
  userID: number = 0;
  @ViewChild(PatientCompleteHistoryComponent) patientCompleteHistoryComponent: PatientCompleteHistoryComponent;
  constructor(private dataService: DataService, private patientService: PatientService) { }

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
      if (this.userID >= 0 && this.patientCompleteHistoryComponent && this.patientCompleteHistoryComponent.patientTreatments.length == 0) {
        this.patientCompleteHistoryComponent.GetAllTreatmentsForUser(this.userID);
      }
    }
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
   var patient:Patient = new Patient();
   patient.UserID = this.dataService.getUser()?.ID || 0;
   patient.PatientTreatment = new PatientTreatment();
   patient.PatientAppointments = new Array<PatientAppointment>();
   patient.PatientReports = new Array<PatientReport>();
   this.dataService.setPatient(patient);
  }
  
  SavePatientInformation() {
    const currentPatient = this.dataService.getPatient();
    
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
