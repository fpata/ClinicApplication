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
  styleUrls: ['./user-info.css']
})
export class UserInfoComponent {

  user: User | null = null;

  private userSubscription: Subscription;


  constructor(private dataService: DataService) { 
    this.user = new User();
  }

    ngOnInit() {
    this.userSubscription = this.dataService.user$.subscribe({
      next:(updatedUser: User | null | undefined) => {
        if (!updatedUser) { 
          console.log('No user data available');
          return; 
        }
        this.user = updatedUser;
        this.user.Address = updatedUser.Address ?? null;
        this.user.Contact = updatedUser.Contact ?? null;
        console.log('User data updated:', this.user);
      },
      error: (err: Error) => {
        console.error('Error occurred while updating user data:', err);
      },
      complete: () => {
        console.log('User subscription completed');
      }
    });
    console.log('User subscription initialized', this.userSubscription);
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
    }
  }
}
