import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingrecordComponent } from '../billingrecord.component/billingrecord.component';
import { PaymentComponent } from '../payment.component/payment.component';
import { CreateBillingComponent } from '../create-billing.component/create-billing.component';

@Component({
  selector: 'app-billingmaster.component',
  imports: [CommonModule, BillingrecordComponent, PaymentComponent, CreateBillingComponent],
  templateUrl: './billingmaster.component.html',
  styleUrl: './billingmaster.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class BillingmasterComponent {
  isSearchTabSelected: boolean = true;
  selectedTab: string = 'tbBillingSearch';

  constructor(private cdr: ChangeDetectorRef) {}

  tabSelectedEvent(event: MouseEvent): void {
    const targetId = (event.currentTarget as Element).id;
    if (targetId.startsWith('tbBillingSearch')) {
      this.isSearchTabSelected = true;
    } else {
      this.isSearchTabSelected = false;
    }
    this.selectedTab = targetId;
    this.cdr.markForCheck();
  }

  mobileTabSelectedEvent($event: Event): void {
    const target = $event.target as HTMLSelectElement;
    const targetValue = target.value;
    if (targetValue.startsWith('tbBillingSearch')) {
      this.isSearchTabSelected = true;
    } else {
      this.isSearchTabSelected = false;
    }
    this.selectedTab = targetValue;
    
    const tabElement = document.getElementById(targetValue + "-tab");
    if (tabElement) {
      tabElement.click();
    }
    this.cdr.markForCheck();
  }

  onRecordSelected(): void {
    this.isSearchTabSelected = false;
    this.selectedTab = 'tbPayment';
    setTimeout(() => {
      const tabElement = document.getElementById('tbPayment-tab');
      if (tabElement) {
        tabElement.click();
      }
      this.cdr.markForCheck();
    }, 100);
  }
}
