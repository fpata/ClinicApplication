import { Address } from './address.model';
import { Contact } from './contact.model';
import { Patient } from './patient.model';

export class User {
  ID: number =0;
  FirstName: string;
  MiddleName?: string;
  LastName: string;
  UserName: string;
  Password: string;
  UserType: string;
  Gender?: string ='male';
  DOB?: string;
  Age?: number;
  LastLoginDate?: Date = new Date();
  Address: Address;
  Contact?: Contact;
  Patients?: Patient[];
  CreatedDate?: Date = new Date();
  ModifiedDate?: Date = new Date();
  CreatedBy?: number = 1;
  ModifiedBy?: number =1;
  IsActive?: boolean = true;
}
