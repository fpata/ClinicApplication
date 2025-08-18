import { Component, ViewChild } from '@angular/core';
import { UserSearch } from "../user-search/user-search.component";
import { UserInfoComponent } from "../user-info/user-info.component";
import { UserQuickCreateComponent } from "../user-quick-create/user-quick-create.component";
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-user-master',
  standalone: true,
  imports: [UserSearch, UserInfoComponent, UserQuickCreateComponent],
  templateUrl: './user-master.component.html',
  styleUrls: ['./user-master.component.css'],
  providers: [HttpClient]
})
export class UserMasterComponent {

  isSearchTabSelected: boolean = true;
  selectedTab: string = 'tbUserSearch';
  @ViewChild(UserQuickCreateComponent) quickCreateComponent!: UserQuickCreateComponent;
  @ViewChild(UserInfoComponent) userInfoComponent!: UserInfoComponent;

  constructor(private dataService: DataService, private userService: UserService, private messageService: MessageService) { }

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
      this.messageService.warn('No user selected for deletion');
      return;
    }

    if (confirm(`Are you sure you want to delete user: ${currentUser.FirstName} ${currentUser.LastName}?`)) {
      this.userService.deleteUser(currentUser.ID).subscribe({
        next: () => {
          this.messageService.success('User deleted successfully');
          this.ClearUserInformation(); // Clear the user from data service
        },
        error: (error) => {
          this.messageService.error('Error deleting user: ' + error.message);
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
      this.messageService.warn('No user data to save');
      return;
    }

    if (!currentUser.ID || currentUser.ID === 0) {
      // Create new user (POST)
      this.userService.createUser(currentUser).subscribe({
        next: (newUser) => {
          this.messageService.success('User created successfully');
          this.dataService.setUser(newUser); // Update with the new user data including ID
        },
        error: (error) => {
          this.messageService.error('Error creating user: ' + error.message);
        }
      });
    } else {
      // Update existing user (PUT)
      this.userService.updateUser(currentUser.ID, currentUser).subscribe({
        next: (updatedUser) => {
          this.messageService.success('User updated successfully');
          this.dataService.setUser(updatedUser); // Update with the latest user data
        },
        error: (error) => {
          this.messageService.error('Error updating user: ' + error.message);
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


