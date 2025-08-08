import { User } from './user.model';
import { Patient } from './patient.model';
export class PatientAppointment {
  ID: number;
  UserID?: number;
  StartApptDate: Date = new Date();
  EndApptDate?: Date;
  TreatmentName?: string;
  DoctorID?: number;
  DoctorName?: string;
  ApptStatus?: string;
  PatientID?: number;
  PatientName?: string;
  IsActive?: boolean =true;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string;
  ModifiedBy?: number;
  user?: User;
  doctor?: User;
  patient?: Patient;
}
