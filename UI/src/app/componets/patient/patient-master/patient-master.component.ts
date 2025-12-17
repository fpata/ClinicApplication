import { Component, viewChild, ViewChild, ChangeDetectionStrategy } from '@angular/core';
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
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-patient-master',
  standalone: true,
  templateUrl: './patient-master.component.html',
  styleUrls: ['./patient-master.component.css'],
  imports: [PatientAppointmentComponent, PatientHistoryComponent, PatientReportComponent,
    PatientSearchComponent, PatientTreatmentComponent,
    PatientCompleteHistoryComponent, PatientQuickCreateComponent, PatientVitalsComponent],
  providers: [HttpClient],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class PatientMasterComponent {
  selectedTab: string = 'Search';
  showTabs: boolean = false;
  showQuickCreate: boolean = false;
  user:User|null = null; 
  private subscriptions :Subscription[] = [];

  @ViewChild(PatientCompleteHistoryComponent) patientCompleteHistoryComponent: PatientCompleteHistoryComponent;
  @ViewChild(PatientQuickCreateComponent) quickCreateComponent!: PatientQuickCreateComponent;
  constructor(private dataService: DataService, private patientService: PatientService, private util: UtilityService,
    private messageService: MessageService
  ) { }

  tabSelectedEvent(event: MouseEvent) {
    const targetElement = event.currentTarget as HTMLElement;
    // Remove -tab suffix to get the base id
    if (targetElement.innerText.startsWith('Previous')) {
      this.user.ID = this.dataService.getUser()?.ID ?? 0;
      if (this.user.ID > 0 && this.patientCompleteHistoryComponent) {
        this.patientCompleteHistoryComponent.GetAllTreatmentsForUser(this.user.ID);
      }
    }
    this.selectedTab = targetElement.innerText;
     console.log("Selected Tab = " + this.selectedTab)
  }

  ClearPatientInformation() {
    this.dataService.setPatient(null);
    this.dataService.setUser(null);
   // this.patientCompleteHistoryComponent?.patientTreatments = []|null;
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
          console.error('Error deleting patient:', error?.message || error?.toString());
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
    if (this.selectedTab.startsWith('Quick')) {
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
          this.dataService.setPatient(savedPatient);
        },
        error: (error) => {
          console.error('Error creating patient:', error?.message || error?.toString());
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
          this.messageService.error('Error occurred while updating patient information. Please try again.');
          console.log('Error updating patient:', error);
        }
      });
    }
  }

  ngOnInit() {
   this.subscriptions.push(this.dataService.IsQuickCreateMode$.subscribe({
      next: (isQuickCreate) => {
        this.showQuickCreate = isQuickCreate;
        this.ShowHideTabs();
      },
      error: (error) => {
        console.error('Error subscribing to IsQuickCreateMode changes:', error?.message || error?.toString());
      }
    }));
      this.subscriptions.push(this.dataService.user$.subscribe({
      next: (newUser) => {
        this.user = newUser;
        this.ShowHideTabs();
      },
      error: (error) => {
        console.error('Error subscribing to IsQuickCreateMode changes:', error?.message || error?.toString());
      }
    }));
  }


  private ShowHideTabs() {
    if (this.user) {
      if (this.showQuickCreate) {
        this.showTabs = false;
        this.selectedTab = 'Quick Create';
      } else {
        this.showTabs = true;
        this.showQuickCreate = false;
        this.selectedTab = 'Patient Vitals';
      }
    } else {
      this.showTabs = false;
      this.showQuickCreate = false;
      this.selectedTab = 'Search';
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
    this.selectedTab = 'Search';
   
    // Clear any existing patient data
    this.ClearPatientInformation();
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
