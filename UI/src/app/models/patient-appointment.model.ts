import { User } from './user.model';
import { Patient } from './patient.model';
export interface PatientAppointment {
  ID: number;
  UserID?: number;
  ApptDate?: string;
  ApptTime?: string;
  TreatmentName?: string;
  DoctorID?: number;
  DoctorName?: string;
  ApptStatus?: string;
  PatientID?: number;
  PAtientName?: string;
  IsActive?: boolean;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string;
  ModifiedBy?: number;
  user?: User;
  doctor?: User;
  patient?: Patient;
}
