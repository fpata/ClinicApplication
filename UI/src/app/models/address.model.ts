import { User } from './user.model';
export interface Address {
  ID: number;
  Address1?: string;
  Address2?: string;
  State?: string;
  City?: string;
  Country?: string;
  AddressType: string;
  ZipCode?: string;
  UserID?: number;
  User?: User;
}
