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
  IsActive?: boolean = true;
  CreatedDate?: Date = new Date();
  CreatedBy?: number = 1;
  ModifiedDate?: Date = new Date();
  ModifiedBy?: number =1;
  user?: User;
}
