import { Patient } from "./patient.model";
import { User } from "./user.model";

export interface PatientReport {
  ID: number;
  UserID?: number;
  User?: User;
  ReportName?: string;
  ReportDetails?: string;
  ReportFilePath?: string;
  DoctorName?: string;
  ReportDate?: string; // DateTime as ISO string
  PatientID?: number;
  Patient?: Patient;
}
