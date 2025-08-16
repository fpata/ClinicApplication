import { Address } from './address.model';
import { BaseEntity } from './base.model';
import { Contact } from './contact.model';
import { Patient } from './patient.model';

export class User extends BaseEntity {
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  UserName?: string;
  Password?: string;
  UserType?: string;
  Gender?: string;
  DOB?: string | null;
  Age?: number;
  LastLoginDate?: string; // set via UtilityService when needed
  Address?: Address;
  Patients?: any;
  Contact?: Contact;
  FullName?: string;
}
