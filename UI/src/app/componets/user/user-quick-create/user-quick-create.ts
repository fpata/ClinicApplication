import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-quick-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-quick-create.html',
  styleUrl: './user-quick-create.css'
})
export class UserQuickCreateComponent {

  quickCreateForm: FormGroup;

  constructor(
    private dataService: DataService, 
    private userService: UserService, 
    private fb: FormBuilder
  ) { 
    this.quickCreateForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      userType: ['', Validators.required],
      address1: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      zipCode: [''],
      primaryPhone: ['', Validators.required],
      primaryEmail: ['', [Validators.required, Validators.email]]
    });
  }

  onQuickCreateSubmit() {
    if (this.quickCreateForm.valid) {
      const formValue = this.quickCreateForm.value;
      
      // Create user object with address and contact
      const newUser: User = {
        ID: 0,
        FirstName: formValue.firstName,
        LastName: formValue.lastName,
        UserName: formValue.userName,
        Password: formValue.password,
        UserType: formValue.userType,
        Address: {
          ID: 0,
          PermAddress1: formValue.address1,
          PermCity: formValue.city,
          PermState: formValue.state,
          PermCountry: formValue.country,
          PermZipCode: formValue.zipCode,
          AddressType: 'Permanent'
        } as Address,
        Contact: {
          ID: 0,
          PrimaryPhone: formValue.primaryPhone,
          PrimaryEmail: formValue.primaryEmail
        } as Contact
      };

      // Call the service to create user
      this.userService.createUser(newUser).subscribe({
        next: (createdUser) => {
          console.log('User created successfully', createdUser);
          this.dataService.setUser(createdUser);
          this.quickCreateForm.reset();
          // Emit event to parent component to switch to user info tab
          this.switchToUserInfoTab();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          // You might want to show a user-friendly error message here
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.quickCreateForm.controls).forEach(key => {
        this.quickCreateForm.get(key)?.markAsTouched();
      });
    }
  }

  onClear() {
    this.quickCreateForm.reset();
  }

  private switchToUserInfoTab() {
    // Programmatically switch to the Personal Information tab
    const personalInfoTab = document.getElementById('tbPersonalInfo-tab');
    if (personalInfoTab) {
      personalInfoTab.click();
    }
  }
}
