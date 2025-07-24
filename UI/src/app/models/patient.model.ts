import { User } from './user.model';
export interface Patient {
  ID: number;
  UserID?: number;
  User?: User;
  Allergies?: string;
  Medications?: string;
  FatherHistory?: string;
  MotherHistory?: string;
}
