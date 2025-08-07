import { User } from './user.model';

export class Address {

  ID: number =0;
  PermAddress1?: string;
  PermAddress2?: string;
  PermState?: string;
  PermCity?: string;
  PermCountry?: string;
  AddressType: string;
  PermZipCode?: string;
  UserID?: number =0;
  IsActive?: boolean = true;
  CreatedDate?: Date = new Date();
  CreatedBy?: number = 1;
  ModifiedDate?: Date = new Date();
  ModifiedBy?: number = 1;
  CorrAddress1?: string;
  CorrAddress2?: string;
  CorrCity?: string;
  CorrState?: string;
  CorrCountry?: string;
  CorrZipCode?: string;
  user?: User;

}
