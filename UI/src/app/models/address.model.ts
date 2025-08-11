export class Address {
  ID?: number;
  PermAddress1?: string;
  PermAddress2?: string;
  PermState?: string;
  PermCity?: string;
  PermCountry?: string;
  PermZipCode?: string;
  CorrAddress1?: string;
  CorrAddress2?: string;
  CorrCity?: string;
  CorrState?: string;
  CorrCountry?: string;
  CorrZipCode?: string;
  AddressType?: string;
  UserID?: number;
  CreatedDate?: string;
  ModifiedDate?: string;
  CreatedBy?: number;
  ModifiedBy?: number;
  IsActive?: number;
  user?: any; // Avoid circular reference
}
