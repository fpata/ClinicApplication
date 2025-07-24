import { PatientTreatment } from "./patient-treatment.model";
import { Patient } from "./patient.model";
import { User } from "./user.model";

export interface PatientTreatmentDetail {
  ID: number;
  PatientTreatmentID?: number;
  UserID?: number;
  Tooth?: string;
  Procedure?: string;
  Advice?: string;
  TreatmentDate?: string; // DateTime as ISO string
  PatientID?: number;
  User?: User;
  Patient?: Patient;
  PatientTreatment?: PatientTreatment;
}
