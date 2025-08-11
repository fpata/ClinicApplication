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
  LastLoginDate?: string= new Date().toISOString();
  CreatedDate?: string= new Date().toISOString();
  ModifiedDate?: string= new Date().toISOString();
  CreatedBy?: number= 1;
  ModifiedBy?: number= 1;
  IsActive?: number= 1;
  Address?: Address;
  Patients?: any;
  Contact?: Contact;
}
