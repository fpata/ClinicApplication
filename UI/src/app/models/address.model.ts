import { User } from './user.model';

export interface Address {
  ID: number;
  PermAddress1?: string;
  PermAddress2?: string;
  PermState?: string;
  PermCity?: string;
  PermCountry?: string;
  AddressType: string;
  ZipCode?: string;
  UserID?: number;
  IsActive?: boolean;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string;
  ModifiedBy?: number;
  CorrAddress1?: string;
  CorrAddress2?: string;
  CorrCity?: string;
  CorrState?: string;
  CorrCountry?: string;
  CorrZipCOde?: string;
  user?: User;
}
