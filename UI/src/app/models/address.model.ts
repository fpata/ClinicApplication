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
  CreatedDate?: string; // set via UtilityService
  ModifiedDate?: string; // set via UtilityService
  CreatedBy?: number = 1;
  ModifiedBy?: number = 1;
  IsActive?: number = 1;
  user?: any; // Avoid circular reference
}
