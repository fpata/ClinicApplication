import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientSearchModel } from '../../../models/patient-search.model';
import { SearchService } from '../../../services/search.service';
import { PatientService } from '../../../services/patient.service';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { User } from '../../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { UtilityService } from '../../../services/utility.service';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.css'],
  providers: [HttpClient]
})
export class PatientSearchComponent {

  searchPatient: PatientSearchModel;
  searchResult: PatientSearchModel[];
  searchLengthConstraintError: boolean = false;
  clearSearchClicked: boolean = false;

  constructor(private searchService: SearchService, private patientService: PatientService,
    private dataService: DataService, private userService: UserService, private router: Router, private util: UtilityService
  ) {
    this.searchPatient = new PatientSearchModel(this.util);
    this.searchPatient.EndDate = this.util.formatDate(new Date(), 'yyyy-MM-dd');
    this.searchPatient.StartDate = this.util.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    this.searchResult = [];
  }

  validateSearchInput() {
    if (this.searchPatient != null && this.searchPatient != undefined && this.searchPatient.FirstName?.length < 3 && this.searchPatient.LastName?.length < 3 &&
      this.searchPatient.PrimaryEmail?.length < 3 && this.searchPatient.PermCity?.length < 3 &&
      this.searchPatient.PrimaryPhone?.length < 3) {
      this.searchLengthConstraintError = true;
      this.clearSearchClicked = false;
    } else {
      this.searchLengthConstraintError = false;
      this.clearSearchClicked = true;
    }
  }

  SearchPatient() {
    if (this.searchLengthConstraintError) {
      return;
    }
    this.searchService.searchUser(this.searchPatient).subscribe({
      next: (result) => {
        this.searchResult = result;
        this.clearSearchClicked = false;
      },
      error: (err) => {
        // Optionally handle error
        alert('Error occurred while searching for patients.');
        console.error(err);
        this.searchResult = [];
        this.clearSearchClicked = false;
      }
    });
  }

  clearSearch() {
    this.searchLengthConstraintError = false;
    this.searchPatient.FirstName = '';
    this.searchPatient.LastName = '';
    this.searchPatient.PatientID = 0;
    this.searchPatient.PermCity = '';
    this.searchPatient.PrimaryEmail = '';
    this.searchPatient.PrimaryPhone = '';
    this.searchPatient.UserID = 0;
    this.searchPatient.UserName = '';
    this.searchPatient.UserType = 0;
    this.searchResult = [];
    this.clearSearchClicked = true;
  }

  OnPatientIdClick(patientId: number, userId: number) {
    if (patientId === 0 || patientId === undefined || patientId === null) {
      this.userService.getUser(userId).subscribe({
        next: (user: User) => {
          this.dataService.setUser(user);
        },
        error: (err: Error) => {
          console.error('Error fetching user data:', err);
        }
      });
      this.patientService.AddNewPatient();
      document.getElementById('tbPersonalInfo-tab')?.click();
    }
    else {
      this.patientService.getCompletePatient(patientId).subscribe({
        next: (user) => {
          // Handle the patient data as needed
         // console.log('User data:', user);
          this.dataService.setUser(user);
          this.dataService.setPatient(user?.Patients[0] || null);
        },
        error: (err) => {
          console.error('Error fetching patient data:', err);
        }
      });
    }
  }

  AddNewUser() {
    this.router.navigate(['/user', 'new']);
  }
}

