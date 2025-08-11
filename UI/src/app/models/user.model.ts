import { Address } from './address.model';
import { Contact } from './contact.model';
import { Patient } from './patient.model';

export class User {
  ID?: number;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  UserName?: string;
  Password?: string;
  UserType?: string;
  Gender?: string;
  DOB?: string | null;
  Age?: number;
  LastLoginDate?: string;
  CreatedDate?: string;
  ModifiedDate?: string;
  CreatedBy?: number;
  ModifiedBy?: number;
  IsActive?: number;
  Address?: Address;
  Patients?: any;
  Contact?: Contact;
}
