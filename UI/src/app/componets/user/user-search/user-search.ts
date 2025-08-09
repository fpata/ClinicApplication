import { Component } from '@angular/core';
import { PatientSearchModel } from '../../../models/patient-search.model';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel binding 
import { SearchService } from '../../../services/search.service';
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
@Component({
  selector: 'app-user-search',
  imports: [FormsModule],
  templateUrl: './user-search.html',
  styleUrl: './user-search.css',
  providers: [SearchService, DataService, UserService]
})
export class UserSearch {
  searchPatient: PatientSearchModel;
  searchResult: PatientSearchModel[];
  searchLengthConstraintError: boolean = false;
  clearSearchClicked: boolean = false;

  constructor(private searchService: SearchService, private dataService: DataService, private userService: UserService) {
    this.searchPatient = new PatientSearchModel();
    this.searchPatient.EndDate = new Date().toISOString().split('T')[0]; // Default to today
    this.searchPatient.StartDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to 365 days ago
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

  SearchUser() {
    if (this.searchLengthConstraintError) {
      return;
    }
    this.searchService.searchUser(this.searchPatient).subscribe({
      next: (result:any) => {
        this.searchResult = result;
        this.clearSearchClicked = false;
      },
      error: (err:any) => {
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
    this.searchPatient = new PatientSearchModel();

    this.searchResult = [];
    this.clearSearchClicked = true;
  }

  OnUserIdClick(userId: number) {
    this.userService.getUser(userId).subscribe({
      next: (user: User) => {      
        this.dataService.setUser(user);
      },
      error: (err:any) => {
        console.error('Error fetching patient data:', err);
      }
    });
  }
}
