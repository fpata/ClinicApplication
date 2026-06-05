import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BillingRecord, SearchResultBillingRecord } from '../../../models/billing.model';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../../services/blling.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-billingrecord',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './billingrecord.component.html',
  styleUrl: './billingrecord.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingrecordComponent {
  billingRecord: BillingRecord = new BillingRecord();
  searchResult: SearchResultBillingRecord = new SearchResultBillingRecord();

  constructor(
    private billingService: BillingService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  Search(): void {
    this.billingService.searchBillings(this.billingRecord).subscribe((result: SearchResultBillingRecord) => {
      this.searchResult = result;
      this.cdr.markForCheck();
    });
  }

  Clear(): void {
    this.billingRecord = new BillingRecord();
    this.searchResult = new SearchResultBillingRecord();
    this.cdr.markForCheck();
  }

  selectRecord(record: BillingRecord): void {
    this.billingService.setSelectedBillingRecord(record);
    this.router.navigate(['/billing/payment']);
  }
}
