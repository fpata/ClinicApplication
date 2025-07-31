import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Contact } from '../../../models/contact.model';
import { Address } from '../../../models/address.model';

@Component({
  selector: 'app-patient-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-info.html',
  styleUrl: './patient-info.css'
})
export class PatientInfoComponent implements OnInit, OnDestroy {
  user: User | null = null;
  address:Address |null = null;
  contact: Contact | null = null; // Assuming Contact is a model for contact details
  // Subscription to handle user changes
  private userSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Subscribe to user changes from the data service
    this.userSubscription = this.dataService.user$.subscribe({
      next: (user) => {
        this.user = user;
        this.address = this.user.Address; 
        this.contact = this.user.Contact; // Assuming contact details are part of the user model
        console.log('User updated:', user);
      },
      error: (error) => {
        console.error('Error subscribing to user changes:', error);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  OnGenderChanged(gender: string) {
    if (this.user) {
      this.user.Gender = gender;
      console.log(this.user.Gender);
    }
  }

  CopyAddress() {
    if (this.user && this.user.Address) {
      this.user.Address.CorrAddress1 = this.user.Address.PermAddress1;
      this.user.Address.CorrAddress2 = this.user.Address.PermAddress2;
      this.user.Address.CorrCity = this.user.Address.PermCity;
      this.user.Address.CorrState = this.user.Address.PermState;
      this.user.Address.CorrCountry = this.user.Address.PermCountry;
      this.user.Address.CorrZipCode = this.user.Address .PermZipCode;
    }
  }
}

