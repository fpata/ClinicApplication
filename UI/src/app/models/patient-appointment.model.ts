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
  IsActive?: number = 1;
  CreatedDate?: string = new Date().toISOString();
  CreatedBy?: number = 1;
  ModifiedDate?: string = new Date().toISOString();
  ModifiedBy?: number = 1;
  user?: User;
  doctor?: User;
  patient?: Patient;
}
