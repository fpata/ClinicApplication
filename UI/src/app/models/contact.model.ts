export class Contact {
  ID?: number;
  PrimaryPhone?: string;
  SecondaryPhone?: string;
  PrimaryEmail?: string;
  SecondaryEmail?: string;
  RelativeName?: string;
  RelativeRealtion?: string;
  RelativePhone?: string;
  RelativeEmail?: string;
  UserID?: number;
  CreatedDate?: string;
  ModifiedDate?: string;
  CreatedBy?: number;
  ModifiedBy?: number;
  IsActive?: number;
  user?: any; // Avoid circular reference
}
