import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-user-quick-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './user-quick-create.html',
  styleUrl: './user-quick-create.css'
})
export class UserQuickCreateComponent {

user: User | null = null;
 
  // Subscription to handle user changes
  private userSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Subscribe to user changes from the data service
    this.userSubscription = this.dataService.user$.subscribe({
      next: (user) => {
        if(user == null) this.user = new User();
        else this.user = user;
        if (this.user && this.user.Address)  this.user.Address = new Address();
        if (this.user && this.user.Contact)    this.user.Contact = new Contact();
     
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

 
 
}
