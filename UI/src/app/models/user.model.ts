import { Address } from './address.model';
import { Contact } from './contact.model';
import { Patient } from './patient.model';

export interface User {
  ID: number;
  FirstName: string;
  MiddleName?: string;
  LastName: string;
  UserName: string;
  Password: string;
  UserType: string;
  Gender?: string;
  DOB?: string;
  Age?: number;
  LastLoginDate?: string;
  Address: Address;
  Contact?: Contact;
  Patients?: Patient[];
}
