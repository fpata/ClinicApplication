import { Component } from '@angular/core';
import { BillingRecord } from '../../../models/billing.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-billingrecord.component',
  imports: [FormsModule],
  templateUrl: './billingrecord.component.html',
  styleUrl: './billingrecord.component.css'
})
export class BillingrecordComponent {
billingRecord:BillingRecord;

}
