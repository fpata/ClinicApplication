import { Component, ViewChild } from '@angular/core';
import { UserSearch } from "../user-search/user-search";
import { UserInfoComponent } from "../user-info/user-info";
import { UserQuickCreateComponent } from "../user-quick-create/user-quick-create";
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-master',
  standalone: true,
  imports: [UserSearch, UserInfoComponent, UserQuickCreateComponent],
  templateUrl: './user-master.html',
  styleUrl: './user-master.css',
  providers: [HttpClient]
})
export class UserMasterComponent {

  isSearchTabSelected: boolean = true;
  selectedTab: string = 'tbUserSearch';
  @ViewChild(UserQuickCreateComponent) quickCreateComponent!: UserQuickCreateComponent;
  @ViewChild(UserInfoComponent) userInfoComponent!: UserInfoComponent;

  constructor(private dataService: DataService, private userService: UserService) { }

  tabSelectedEvent(event: MouseEvent) {
    // Logic to handle tab selection
    var targetId = (event.currentTarget as Element).id;
    if (targetId.startsWith('tbUserSearch')) {
      this.isSearchTabSelected = true;
    } else {
      this.isSearchTabSelected = false;
    }
    this.selectedTab = targetId;
  }

  ClearUserInformation() {
    this.dataService.setUser(null);
  }

  DeleteUserInformation() {
    const currentUser = this.dataService.getUser();

    if (!currentUser || !currentUser.ID) {
      console.warn('No user selected for deletion');
      return;
    }

    if (confirm(`Are you sure you want to delete user: ${currentUser.FirstName} ${currentUser.LastName}?`)) {
      this.userService.deleteUser(currentUser.ID).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.ClearUserInformation(); // Clear the user from data service
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          // You might want to show a user-friendly error message here
        }
      });
    }
  }

  AddNewUser() {
    this.ClearUserInformation();
    var user: User = new User();
    user.Address = new Address();
    user.Contact = new Contact();
    this.dataService.setUser(user);
    this.isSearchTabSelected = false;
    document.getElementById('tbPersonalInfo-tab')?.click();
  }

  SaveUserInformation() {
    var currentUser: User;
    if (this.selectedTab.startsWith('tbQuickCreate')) {
      currentUser = this.quickCreateComponent.user
    }
    else {

      currentUser = this.dataService.getUser();
      currentUser.Address = this.userInfoComponent.address;
      currentUser.Contact = this.userInfoComponent.contact;
    }
    if (!currentUser) {
      console.warn('No user data to save');
      return;
    }

    if (!currentUser.ID || currentUser.ID === 0) {
      // Create new user (POST)
      this.userService.createUser(currentUser).subscribe({
        next: (newUser) => {
          console.log('User created successfully', newUser);
          this.dataService.setUser(newUser); // Update with the new user data including ID
        },
        error: (error) => {
          console.error('Error creating user:', error);
          // You might want to show a user-friendly error message here
        }
      });
    } else {
      // Update existing user (PUT)
      this.userService.updateUser(currentUser.ID, currentUser).subscribe({
        next: (updatedUser) => {
          console.log('User updated successfully', updatedUser);
          this.dataService.setUser(updatedUser); // Update with the latest user data
        },
        error: (error) => {
          console.error('Error updating user:', error);
          // You might want to show a user-friendly error message here
        }
      });
    }
  }

  QuickCreateUser() {
    // Navigate to the quick create tab
    this.isSearchTabSelected = false;
    // Switch to quick create tab
    setTimeout(() => {
      const quickCreateTab = document.getElementById('tbQuickCreate-tab');
      if (quickCreateTab) {
        quickCreateTab.click();
      }
    }, 100);
  }


}


