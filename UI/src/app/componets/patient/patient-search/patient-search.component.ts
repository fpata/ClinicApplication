import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchModel, SearchResultModel } from '../../../models/search.model';
import { SearchService } from '../../../services/search.service';
import { PatientService } from '../../../services/patient.service';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { User, UserType } from '../../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { UtilityService } from '../../../services/utility.service';
import { MessageService } from '../../../services/message.service';
import { PagingComponent } from "../../../common/paging/paging.component";

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PagingComponent],
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.css'],
  providers: [HttpClient]
})
export class PatientSearchComponent {

  currentPage: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;
  searchPatient: SearchModel;
  searchResult: SearchResultModel;
  searchLengthConstraintError: boolean = false;
  clearSearchClicked: boolean = false;

  constructor(private searchService: SearchService, private patientService: PatientService,
    private dataService: DataService, private userService: UserService, private router: Router, private util: UtilityService
    ,private messageService: MessageService
  ) {
    this.searchPatient = new SearchModel(this.util);
    this.searchPatient.EndDate = this.util.formatDate(new Date(), 'yyyy-MM-dd');
    this.searchPatient.StartDate = this.util.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    this.searchResult = new SearchResultModel();
  }

  ngInit() {
    this.clearSearchClicked = false;
     this.pageSize = this.dataService.getConfig()?.pageSize || 10;
  }

  validateSearchInput() {
    if (this.searchPatient != null && this.searchPatient != undefined
      && (this.searchPatient.FirstName === undefined || this.searchPatient.FirstName?.length < 3)
      && (this.searchPatient.LastName === undefined || this.searchPatient.LastName?.length < 3)
      && (this.searchPatient.PrimaryEmail === undefined || this.searchPatient.PrimaryEmail?.length < 3)
      && (this.searchPatient.PrimaryPhone === undefined || this.searchPatient.PrimaryPhone?.length < 3)) {
      this.searchLengthConstraintError = true;
      this.clearSearchClicked = false;
    } else {
      this.searchLengthConstraintError = false;
      this.clearSearchClicked = true;
    }
  }

  SearchPatient() {
    this.validateSearchInput();
    if (this.searchLengthConstraintError) {
      return;
    }
    this.dataService.setQuickCreateMode(false);
    this.dataService.setUserId(0);
    this.searchPatient.UserType = UserType.Patient; // Set UserType to Admin for searching all patients
    this.searchService.Search(this.searchPatient).subscribe({
      next: (result) => {
        this.searchResult = result;
        this.totalItems = result.TotalCount || 0;
        this.clearSearchClicked = false;
      },
      error: (err) => {
        // Optionally handle error
        alert('Error occurred while searching for patients.');
        console.error(err);
        this.searchResult = new SearchResultModel();
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
    this.searchResult = new SearchResultModel();
    this.clearSearchClicked = true;
    this.dataService.setQuickCreateMode(false);
    this.dataService.setUserId(0);
  }

  OnPatientIdClick(patientId: number, userId: number) {
    if (patientId === 0 || patientId === undefined || patientId === null) {
      this.userService.getUser(userId).subscribe({
        next: (user: User) => {
          this.dataService.setUser(user);
          this.dataService.setUserId(user.ID);
        },
        error: (err: Error) => {
          console.error('Error fetching user data:', err);
        }
      });
      this.patientService.AddNewPatient();
      document.getElementById('tbPersonalInfo-tab')?.click();
    }
  }

  AddNewUser() {
    this.router.navigate(['/user', 'new']);
  }


  DeletePatient(result: SearchModel) {
      if (confirm(`Are you sure you want to delete patient: ${result.FirstName} ${result.LastName}?`)) {
      this.patientService.deletePatient(result.PatientID).subscribe({
        next: () => {
          this.messageService.success('Patient deleted successfully');
         // Clear the patient from data service
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.messageService.error('Error occurred while deleting patient. Please try again.');
        }
      });
    }
  }

  QuickCreatePatient(result: SearchModel) {
    this.dataService.setQuickCreateMode(true);
    this.AddNewPatient(result);
  }

  UpdatePatient(result: SearchModel) {
    if (result.PatientID && result.PatientID > 0) {
      this.patientService.getCompletePatient(result.PatientID).subscribe({
        next: (user) => {
          // Handle the patient data as needed
          // console.log('User data:', user);
          this.dataService.setUser(user);
          this.dataService.setUserId(user.ID);
          this.dataService.setPatient(user?.Patients[0] || null);
        },
        error: (err) => {
          console.error('Error fetching patient data:', err);
        }
      });
    } else {
      this.AddNewPatient(result);
    }
  }

  AddNewPatient(result: SearchModel) {
    this.userService.getUser(result.UserID).subscribe({
      next: (user: User) => {
        this.dataService.setUser(user);
        this.dataService.setUserId(user.ID);
      },
      error: (err: Error) => {
        console.error('Error fetching user data:', err);
      }
    });
    this.patientService.AddNewPatient();
  }

     onPageChanged($event: number) {
        this.currentPage = $event;
        this.searchPatient.pageNumber = this.currentPage;
        this.SearchPatient();
     }
}

