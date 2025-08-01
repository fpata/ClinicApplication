import { User } from './user.model';

export interface Contact {
  ID: number;
  PrimaryPhone: string;
  SecondaryPhone?: string;
  PrimaryEmail: string;
  SecondaryEmail?: string;
  RelativeName?: string;
  RelativeRealtion?: string;
  RelativePhone?: string;
  RelativeEmail?: string;
  UserID?: number;
  IsActive?: boolean;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string;
  ModifiedBy?: number;
  user?: User;
}
