import { Component } from '@angular/core';
import { User, UserType } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-user-quick-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-quick-create.component.html',
  styleUrls: ['./user-quick-create.component.css']
})
export class UserQuickCreateComponent {

user: User | null = null;
 
  // Subscription to handle user changes


  constructor() {
      this.user = new User();
  this.user.Address = new Address();
  this.user.Contact = new Contact();
  }

   onUserTypeChange($event: any) {
      this.user.UserType = Number($event);
  }
}
