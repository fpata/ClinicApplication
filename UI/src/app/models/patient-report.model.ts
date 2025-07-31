import { User } from './user.model';
import { Patient } from './patient.model';
export interface PatientReport {
  ID: number;
  UserID?: number;
  ReportName?: string;
  ReportDetails?: string;
  ReportFilePath?: string;
  DoctorName?: string;
  ReportDate?: string;
  PatientID?: number;
  IsActive?: boolean;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string;
  ModifiedBy?: number;
  user?: User;
  patient?: Patient;
}
