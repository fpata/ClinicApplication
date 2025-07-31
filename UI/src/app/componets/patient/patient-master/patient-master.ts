import { Component } from '@angular/core';
import { PatientAppointmentComponent } from '../patient-appointment/patient-appointment';
import { PatientHistoryComponent } from '../patient-history/patient-history';
import { PatientInfoComponent } from '../patient-info/patient-info';
import { PatientReportComponent } from '../patient-report/patient-report';
import { PatientSearchComponent } from '../patient-search/patient-search';
import { PatientTreatmentComponent } from "../patient-treatment/patient-treatment";

@Component({
  selector: 'app-patient-master',
  templateUrl: './patient-master.html',
  styleUrl: './patient-master.css',
  imports: [PatientAppointmentComponent, PatientHistoryComponent, PatientInfoComponent, PatientReportComponent, PatientSearchComponent, PatientTreatmentComponent]
})
export class PatientMasterComponent {
  isSearchTabSelected: boolean = true;


  constructor() { }

  tabSelectedEvent(event: MouseEvent) {
    // Logic to handle tab selection
    var targetId = (event.currentTarget as Element).id;
    if (targetId.startsWith('tbPatientSearch')) {
      this.isSearchTabSelected = true;
    } else {
      this.isSearchTabSelected = false;
    }
  }
 
  ClearPatientInformation() {
    throw new Error('Method not implemented.');
  }
  DeletePatientInformation() {
    throw new Error('Method not implemented.');
  }
  AddNewPatient() {
    throw new Error('Method not implemented.');
  }
  SavePatientInformation() {
    throw new Error('Method not implemented.');
  }

}
