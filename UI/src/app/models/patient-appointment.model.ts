import { Patient } from "./patient.model";
import { User } from "./user.model";

export interface PatientAppointment {
  ID: number;
  UserID?: number;
  User?: User;
  ApptDate?: string; // DateTime as ISO string
  ApptTime?: string; // TimeSpan as string
  TreatmentName?: string;
  DoctorID?: number;
  ApptStatus?: string;
  PatientID?: number;
  Patient?: Patient;
}
