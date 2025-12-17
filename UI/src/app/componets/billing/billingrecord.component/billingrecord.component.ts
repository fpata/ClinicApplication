import { Component,ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe,DatePipe } from '@angular/common';
import { BillingRecord, SearchResultBillingRecord } from '../../../models/billing.model';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../../services/blling.service';

@Component({
  selector: 'app-billingrecord.component',
  imports: [FormsModule,CurrencyPipe,DatePipe],
  templateUrl: './billingrecord.component.html',
  styleUrl: './billingrecord.component.css',
  standalone: true ,
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class BillingrecordComponent {
  billingRecord: BillingRecord = new BillingRecord();
  searchResult: SearchResultBillingRecord = new SearchResultBillingRecord();

constructor(private billingService: BillingService) {

}
  Search(): void {
    // Search logic here
    this.billingService.searchBillings(this.billingRecord).subscribe((result: SearchResultBillingRecord) => {
      this.searchResult = result;
    });
  }

  Clear(): void {
    // Clear logic here
  }

}
