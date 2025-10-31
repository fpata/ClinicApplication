import { Component, viewChild, ViewChild } from '@angular/core';
import { PatientAppointmentComponent } from '../patient-appointment/patient-appointment.component';
import { PatientHistoryComponent } from '../patient-history/patient-history.component';
import { PatientReportComponent } from '../patient-report/patient-report.component';
import { PatientSearchComponent } from '../patient-search/patient-search.component';
import { PatientTreatmentComponent } from "../patient-treatment/patient-treatment.component";
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { UtilityService } from '../../../services/utility.service';
import { PatientCompleteHistoryComponent } from '../patientcompletehistory/patient-complete-history.component';
import { Patient } from '../../../models/patient.model';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { PatientReport } from '../../../models/patient-report.model';
import { PatientQuickCreateComponent } from '../patient-quick-create/patient-quick-create.component';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { PatientVitalsComponent } from '../patient-vitals/patient-vitals.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-master',
  standalone: true,
  templateUrl: './patient-master.component.html',
  styleUrls: ['./patient-master.component.css'],
  imports: [PatientAppointmentComponent, PatientHistoryComponent, PatientReportComponent,
    PatientSearchComponent, PatientTreatmentComponent,
    PatientCompleteHistoryComponent, PatientQuickCreateComponent, PatientVitalsComponent],
  providers: [HttpClient]
})
export class PatientMasterComponent {

  isSearchTabSelected: boolean = true;
  selectedTab: string = 'tbPatientSearch';
  userID: number = 0;
  showTabs: boolean = false;
  showQuickCreate: boolean = false;
  showSearchTab: boolean = true;
  private userIdSubscription: Subscription = new Subscription();


  @ViewChild(PatientCompleteHistoryComponent) patientCompleteHistoryComponent: PatientCompleteHistoryComponent;
  @ViewChild(PatientQuickCreateComponent) quickCreateComponent!: PatientQuickCreateComponent;
  @ViewChild(PatientVitalsComponent) patientVitalsComponent!: PatientVitalsComponent;
  constructor(private dataService: DataService, private patientService: PatientService, private util: UtilityService,
    private messageService: MessageService
  ) { }

  tabSelectedEvent(event: MouseEvent) {
    const targetElement = event.currentTarget as HTMLElement;
    const targetId = targetElement.id;
    
    // Remove -tab suffix to get the base id
    this.selectedTab = targetId.replace('-tab', '');
    
    if (targetId.startsWith('tbPatientSearch')) {
      this.isSearchTabSelected = true;
    } else {
      this.isSearchTabSelected = false;
    }

    if (targetId.startsWith('tbPreviousInfo')) {
      this.userID = this.dataService.getUser()?.ID ?? 0;
      if (this.userID > 0 && this.patientCompleteHistoryComponent) {
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
      this.messageService.error('No patient selected for deletion');
      return;
    }

    // Get patient name from the associated user
    const patientName = currentPatient.user ?
      `${currentPatient.user.FirstName} ${currentPatient.user.LastName}` :
      `Patient ID: ${currentPatient.ID}`;

    if (confirm(`Are you sure you want to delete patient: ${patientName}?`)) {
      this.patientService.deletePatient(currentPatient.ID).subscribe({
        next: () => {
          this.messageService.success('Patient deleted successfully');
          this.ClearPatientInformation(); // Clear the patient from data service
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.messageService.error('Error occurred while deleting patient. Please try again.');
        }
      });
    }
  }

  AddNewPatient() {
    var userID = this.dataService.getUser()?.ID || 0;
    if (userID === 0) {
      this.messageService.error('No user present. Create a new user first');
      return;
    }
    this.patientService.AddNewPatient();
  }

  SavePatientInformation() {
    var currentPatient = this.dataService.getPatient();
    if (this.selectedTab.startsWith('tbQuickCreate')) {
      currentPatient = this.quickCreateComponent.patient;
      currentPatient.UserID = this.dataService.getUser()?.ID || 0;
      currentPatient.PatientTreatment.UserID = this.dataService.getUser()?.ID || 0;
    }

    if (!currentPatient) {
      this.messageService.error('No patient information to save');
      return;
    }

    // Validate required fields
    if (!currentPatient.UserID) {
      this.messageService.error('User ID is required');
      return;
    }

    // Determine if this is a new patient or existing patient
    const isNewPatient = !currentPatient.ID || currentPatient.ID === 0;

    if (isNewPatient) {
      // Create new patient
      this.patientService.createPatient(currentPatient).subscribe({
        next: (savedPatient) => {
          this.messageService.success('Patient information saved successfully');
          // Update the patient in data service with the returned patient (which includes the new ID)
          this.dataService.setPatient(savedPatient);
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          this.messageService.error('Error occurred while saving patient information. Please try again.');
        }
      });
    } else {
      // Update existing patient
      this.patientService.updatePatient(currentPatient.ID, currentPatient).subscribe({
        next: (updatedPatient) => {
          this.messageService.success('Patient information updated successfully');
          // Update the patient in data service with the returned updated patient
          this.dataService.setPatient(updatedPatient);
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          this.messageService.error('Error occurred while updating patient information. Please try again.');
        }
      });
    }
  }

  ngOnInit() {
    this.userIdSubscription = this.dataService.userId$.subscribe({
      next: (id: number | null) => {
        this.userID = id || 0;
        this.ShowHideTabs();
      },
      error: (error) => {
        console.error('Error subscribing to userId changes:', error);
      }
    });
    this.dataService.IsQuickCreateMode$.subscribe({
      next: (isQuickCreate) => {
        this.showQuickCreate = isQuickCreate;
        if (this.showQuickCreate) {
          this.showTabs = false;
          document.getElementById('tbQuickCreate-tab')?.click();
        }
        this.ShowHideTabs();
      },
      error: (error) => {
        console.error('Error subscribing to IsQuickCreateMode changes:', error);
      }
    });
  }

  private ShowHideTabs() {
    // Logic to show/hide tabs based on certain conditions
    if (this.userID !== 0) {
      if (this.showQuickCreate) {
        this.showTabs = false;
        this.showSearchTab = false;
        this.selectedTab = 'tbQuickCreate';
        this.isSearchTabSelected = false;
      } else {
        this.showTabs = true;
        this.showSearchTab = false;
        this.showQuickCreate = false;
        this.isSearchTabSelected = false;
        this.selectedTab = 'tbPatientVitals';
      }
    } else {
      this.showTabs = false;
      this.showSearchTab = true;
      this.showQuickCreate = false;
      this.selectedTab = 'tbPatientSearch';
      this.isSearchTabSelected = true;
    }
  }

  QuickCreatePatient() {
    this.showQuickCreate = true;
    this.ShowHideTabs();
    this.AddNewPatient();
  }
  SearchPatientInformation() {
    // Update state variables
    this.showQuickCreate = false;
    this.showTabs = false;
    this.showSearchTab = true;
    this.selectedTab = 'tbPatientSearch';
    this.isSearchTabSelected = true;
    
    // Clear any existing patient data
    this.ClearPatientInformation();
  }

}
