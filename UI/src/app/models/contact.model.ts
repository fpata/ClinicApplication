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
  CreatedDate?: string = new Date().toISOString();
  ModifiedDate?: string = new Date().toISOString();
  CreatedBy?: number = 1;
  ModifiedBy?: number = 1;
  IsActive?: number = 1;
  user?: any; // Avoid circular reference
}
