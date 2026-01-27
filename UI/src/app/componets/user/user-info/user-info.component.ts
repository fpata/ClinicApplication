import { ChangeDetectionStrategy, Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserType } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { DataService } from '../../../services/data.service';
import { Subscription } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';


@Component({
  selector: 'app-user-info',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoComponent {

  @ViewChild('userForm') userForm!: NgForm;

  user: User | null = null;
  formSubmitted = false;

  private userSubscription: Subscription;


  constructor(private dataService: DataService, private messageService: MessageService, private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {
    // Don't initialize with new objects - wait for actual data
    this.user = null;
  }

  ngOnInit() {
    this.userSubscription = this.dataService.user$.subscribe({
      next: (updatedUser: User | null | undefined) => {
        if (!updatedUser) {
          this.InitializeNewUser();
        } else {
          // Simply assign the updated user without overriding nested objects
          this.user = updatedUser;
        }
        this.formSubmitted = false;
        this.cdRef.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error occurred while updating user data:', err);
        this.cdRef.detectChanges();
      },
      complete: () => {
        console.log('User subscription completed');
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  CopyAddress() {
    if (this.user && this.user.Address) {
      this.user.Address.CorrAddress1 = this.user.Address.PermAddress1;
      this.user.Address.CorrAddress2 = this.user.Address.PermAddress2;
      this.user.Address.CorrCity = this.user.Address.PermCity;
      this.user.Address.CorrState = this.user.Address.PermState;
      this.user.Address.CorrCountry = this.user.Address.PermCountry;
      this.user.Address.CorrZipCode = this.user.Address.PermZipCode;
      this.cdRef.detectChanges();
    }
  }

  onUserTypeChange($event: any) {
    if (this.user && $event === "2") {
      this.user.UserType = UserType.Doctor;
    }
  }

  ClearUserInformation() {
    this.dataService.setUser(null);
    this.InitializeNewUser();
    this.formSubmitted = false;
    if (this.userForm) {
      this.userForm.resetForm();
    }
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
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.messageService.error('Error deleting user: ' + error.message);
        }
      });
    }
  }

  SaveUserInformation() {
    this.formSubmitted = true;
    
    if (!this.userForm || !this.userForm.valid) {
      this.messageService.warn('Please fill out all required fields correctly');
      this.cdRef.detectChanges();
      return;
    }

    if (!this.user.ID || this.user.ID === 0) {
      // Create new user (POST)
      this.userService.createUser(this.user).subscribe({
        next: (newUser) => {
          this.messageService.success('User created successfully');
          this.dataService.setUser(newUser); // Update with the new user data including ID
          this.formSubmitted = false;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.messageService.error('Error creating user: ' + error.message);
          this.cdRef.detectChanges();
        }
      });
    } else {
      // Update existing user (PUT)
      this.userService.updateUser(this.user.ID, this.user).subscribe({
        next: (updatedUser) => {
          this.messageService.success('User updated successfully');
          this.dataService.setUser(updatedUser); // Update with the latest user data
          this.formSubmitted = false;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.messageService.error('Error updating user: ' + error.message);
          this.cdRef.detectChanges();
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
    this.cdRef.detectChanges();
  }
}
