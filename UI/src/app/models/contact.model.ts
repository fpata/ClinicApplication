import { User } from './user.model';

export class Contact {
  ID: number =0;
  PrimaryPhone: string;
  SecondaryPhone?: string;
  PrimaryEmail: string;
  SecondaryEmail?: string;
  RelativeName?: string;
  RelativeRealtion?: string;
  RelativePhone?: string;
  RelativeEmail?: string;
  UserID?: number;
  IsActive?: number = 1;
  CreatedDate?: string = new Date().toISOString();
  CreatedBy?: number = 1;
  ModifiedDate?: string = new Date().toISOString();
  ModifiedBy?: number =1;
  user?: User;
}
