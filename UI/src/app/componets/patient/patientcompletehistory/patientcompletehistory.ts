import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientSearchModel } from '../../../models/patient-search.model';

@Component({
  selector: 'app-patientcompletehistory',
  imports: [FormsModule],
  templateUrl: './patientcompletehistory.html',
  styleUrl: './patientcompletehistory.css'
})

export class PatientCompleteHistoryComponent {
validateSearchInput() {
throw new Error('Method not implemented.');
}
SearchPatient() {
throw new Error('Method not implemented.');
}
clearSearch() {
throw new Error('Method not implemented.');
}
OnPatientIdClick(arg0: any) {
throw new Error('Method not implemented.');
}
searchPatient: PatientSearchModel;
searchLengthConstraintError: boolean = false;
searchResult: any;
clearSearchClicked: any;

}
