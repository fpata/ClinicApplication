import { Payment } from "./payment.model";
import { BaseEntity } from "./base.model";

export class BillingRecord extends BaseEntity {

 TreatmentID?: number;
 PatientID?: number;
 DoctorID?: number;

  // Snapshot fields (denormalized for historical accuracy)
  PatientName?: string;
  DoctorName?: string;
  TreatmentName?: string;

  ServiceDate?: string;            // ISO date (from StartApptDate)
  PostedDate?: string;             // When the bill was generated
  Status?: BillingStatus;


  Subtotal?: number;
  TaxTotal?: number;
  DiscountTotal?: number;
  AdjustmentTotal?: number;
  Total?: number;                  // (Subtotal + Tax - Discount + Adjustment)
  AmountPaid?: number;
  BalanceDue?: number;

  Insurance?: InsuranceSegment;
  Payments?: Payment[];
  Notes?: string;
}

export enum BillingStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
  Voided = 'Voided',
  Adjusted = 'Adjusted'
}

export class InsuranceSegment {
  PayerName?: string;
  PolicyNumber?: string;
  GroupNumber?: string;
  CoveragePercent?: number;     // e.g. 0.8 for 80%
  DeductibleApplied?: number;
  CopayAmount?: number;
  CoinsuranceAmount?: number;
  InsurancePortion?: number;    // Calculated
  PatientPortion?: number;      // Calculated
  AdjudicationRef?: string;
  Status?: InsuranceStatus;
}

export enum InsuranceStatus {
  Pending = 'Pending',
  Submitted = 'Submitted',
  Denied = 'Denied',
  Paid = 'Paid',
  Partial = 'Partial'
}