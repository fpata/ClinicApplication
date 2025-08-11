import { Component } from '@angular/core';
import { PatientSearchModel } from '../../../models/patient-search.model';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel binding 
import { SearchService } from '../../../services/search.service';
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-search.html',
  styleUrl: './user-search.css',
  providers: [SearchService, UserService]
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
      error: (err: any) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  

  
}
/*
private mapToUserModel(response: any): User {
    const user = new User();
    
    // Map basic properties
    user.ID = response.ID;
    user.FirstName = response.FirstName;
    user.MiddleName = response.MiddleName;
    user.LastName = response.LastName;
    user.UserName = response.UserName;
    user.Password = response.Password;
    user.UserType = response.UserType;
    user.Gender = response.Gender;
    user.DOB = response.DOB;
    user.Age = response.Age;
    user.LastLoginDate = response.LastLoginDate;
    user.CreatedDate = response.CreatedDate;
    user.ModifiedDate = response.ModifiedDate;
    user.CreatedBy = response.CreatedBy;
    user.ModifiedBy = response.ModifiedBy;
    user.IsActive = response.IsActive;
    user.Patients = response.Patients;
    
    // Map Address if present
    if (response.Address) {
      const address = new Address();
      Object.assign(address, response.Address);
      user.Address = address;
    }
    
    // Map Contact if present
    if (response.Contact) {
      const contact = new Contact();
      Object.assign(contact, response.Contact);
      user.Contact = contact;
    }
    
    return user;
  }*/