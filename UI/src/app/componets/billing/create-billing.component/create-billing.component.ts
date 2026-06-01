import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingRecord, BillingStatus } from '../../../models/billing.model';
import { BillingService } from '../../../services/blling.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-create-billing',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-billing.component.html',
  styleUrl: './create-billing.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateBillingComponent {
  newBilling: BillingRecord = this.initBillingRecord();
  billingStatuses = Object.values(BillingStatus);
  formSubmitted = false;

  @Output() onBillingCreated = new EventEmitter<void>();

  constructor(
    private billingService: BillingService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  private initBillingRecord(): BillingRecord {
    const record = new BillingRecord();
    record.Status = BillingStatus.Submitted;
    record.ServiceDate = new Date().toISOString().substring(0, 10);
    record.Subtotal = 0;
    record.TaxTotal = 0;
    record.DiscountTotal = 0;
    record.AdjustmentTotal = 0;
    record.Total = 0;
    record.AmountPaid = 0;
    record.BalanceDue = 0;
    record.Notes = '';
    return record;
  }

  calculateTotal(): void {
    const subtotal = Number(this.newBilling.Subtotal) || 0;
    const tax = Number(this.newBilling.TaxTotal) || 0;
    const discount = Number(this.newBilling.DiscountTotal) || 0;
    const adjustment = Number(this.newBilling.AdjustmentTotal) || 0;

    this.newBilling.Total = subtotal + tax - discount + adjustment;
    this.newBilling.BalanceDue = this.newBilling.Total - (this.newBilling.AmountPaid || 0);
    this.cdr.markForCheck();
  }

  CreateBilling(form: any): void {
    this.formSubmitted = true;
    if (!form.valid) {
      this.messageService.warn('Please fill out all required fields correctly');
      return;
    }

    if (Number(this.newBilling.Subtotal) <= 0) {
      this.messageService.warn('Subtotal must be greater than 0');
      return;
    }

    // Format dates and ensure numbers are properly parsed
    const billingToPost: BillingRecord = {
      ...this.newBilling,
      Subtotal: Number(this.newBilling.Subtotal),
      TaxTotal: Number(this.newBilling.TaxTotal),
      DiscountTotal: Number(this.newBilling.DiscountTotal),
      AdjustmentTotal: Number(this.newBilling.AdjustmentTotal),
      Total: Number(this.newBilling.Total),
      BalanceDue: Number(this.newBilling.BalanceDue),
      ServiceDate: new Date(this.newBilling.ServiceDate!).toISOString(),
      PostedDate: new Date().toISOString()
    };

    this.billingService.createBilling(billingToPost).subscribe({
      next: (createdRecord: BillingRecord) => {
        this.messageService.success('Billing record created successfully');
        this.formSubmitted = false;
        // Select the newly created record and emit event
        this.billingService.setSelectedBillingRecord(createdRecord);
        this.onBillingCreated.emit();
        this.newBilling = this.initBillingRecord();
        form.resetForm(this.newBilling);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.messageService.error('Error creating billing record: ' + (err.message || err.statusText || err));
      }
    });
  }

  resetForm(form: any): void {
    this.newBilling = this.initBillingRecord();
    this.formSubmitted = false;
    form.resetForm(this.newBilling);
    this.cdr.markForCheck();
  }
}
