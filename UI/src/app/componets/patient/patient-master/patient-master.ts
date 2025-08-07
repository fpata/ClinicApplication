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

@Component({
  selector: 'app-patient-master',
  templateUrl: './patient-master.html',
  styleUrl: './patient-master.css',
  imports: [PatientAppointmentComponent, PatientHistoryComponent, PatientReportComponent, PatientSearchComponent, PatientTreatmentComponent, PatientCompleteHistoryComponent]
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
    throw new Error('Method not implemented.');
  }

  QuickCreatePatient() {
    throw new Error('Method not implemented.');
  }
}
