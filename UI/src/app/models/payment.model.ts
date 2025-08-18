export interface Payment {
  PaymentID: number;
  BillingID: number;
  Amount: number;
  Method: PaymentMethod;
  TransactionDate: string;   // ISO datetime
  Reference?: string;        // Check #, Auth code, etc.
  Notes?: string;
}
export enum PaymentMethod {
  Cash = 'Cash',
  CreditCard = 'CreditCard',
  DebitCard = 'DebitCard',
  Check = 'Check',
  BankTransfer = 'BankTransfer',
  Insurance = 'Insurance',
  Adjustment = 'Adjustment',
  WriteOff = 'WriteOff'
}