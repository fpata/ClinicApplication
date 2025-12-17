import { ChangeDetectionStrategy, Component } from '@angular/core';
import { User, UserType } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { DataService } from '../../../services/data.service';
@Component({
  selector: 'app-user-quick-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-quick-create.component.html',
  styleUrls: ['./user-quick-create.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserQuickCreateComponent {

user: User | null = null;
 
  // Subscription to handle user changes


  constructor(private dataService: DataService, private messageService: MessageService, private userService: UserService) {
   this.InitializeNewUser();
  }

   onUserTypeChange($event: any) {
      this.user.UserType = Number($event);
  }

ClearUserInformation() {
    this.dataService.setUser(null);
    this.InitializeNewUser();
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
    this.InitializeNewUser();
  }

  SaveUserInformation() {
    if (!this.user.ID || this.user.ID === 0) {
      // Create new user (POST)
      this.userService.createUser(this.user).subscribe({
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
      this.userService.updateUser(this.user.ID, this.user).subscribe({
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

  InitializeNewUser() {
    this.user = new User();
    this.user.Address = new Address();
    this.user.Contact = new Contact();
    this.user.ID = 0; // Indicate new user
    this.user.Address.ID = 0;
    this.user.Contact.ID = 0;
  }
}
