import { Component } from '@angular/core';
import { PatientAppointmentComponent } from '../patient-appointment/patient-appointment';
import { PatientHistoryComponent } from '../patient-history/patient-history';
import { PatientReportComponent } from '../patient-report/patient-report';
import { PatientSearchComponent } from '../patient-search/patient-search';
import { PatientTreatmentComponent } from "../patient-treatment/patient-treatment";
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-patient-master',
  templateUrl: './patient-master.html',
  styleUrl: './patient-master.css',
  imports: [PatientAppointmentComponent, PatientHistoryComponent,  PatientReportComponent, PatientSearchComponent, PatientTreatmentComponent]
})
export class PatientMasterComponent {
QuickCreatePatient() {
throw new Error('Method not implemented.');
}
  isSearchTabSelected: boolean = true;


  constructor(private dataService: DataService) { }

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
   this.dataService.setPatient(null);
   this.dataService.setUser(null);
  }

  DeletePatientInformation() {
  }
  AddNewPatient() {
    throw new Error('Method not implemented.');
  }
  SavePatientInformation() {
    throw new Error('Method not implemented.');
  }

}
