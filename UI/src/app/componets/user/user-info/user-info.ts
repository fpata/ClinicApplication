import { Component } from '@angular/core';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { DataService } from '../../../services/data.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-info',
  imports: [FormsModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css'
})
export class UserInfoComponent {

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
        if (this.user && this.user.Address)  this.address = this.user.Address;
      
        if (this.user && this.user.Contact)    this.contact = this.user.Contact;
       
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
