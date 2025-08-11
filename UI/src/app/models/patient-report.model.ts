import { User } from './user.model';
import { Patient } from './patient.model';
export class PatientReport {
  ID: number;
  UserID?: number;
  ReportName?: string;
  ReportDetails?: string;
  ReportFilePath?: string;
  DoctorName?: string;
  ReportDate?: string;
  PatientID?: number;
  IsActive?: number = 1;
  CreatedDate?: string = new Date().toISOString();
  CreatedBy?: number = 1;
  ModifiedDate?: string = new Date().toISOString();
  ModifiedBy?: number = 1;
  user?: User;
  patient?: Patient;
}
