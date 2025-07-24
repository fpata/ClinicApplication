import { Patient } from "./patient.model";
import { User } from "./user.model";

export interface PatientTreatment {
  ID: number;
  UserID: number;
  ChiefComplaint: string;
  Observation?: string;
  TreatmentPlan: string;
  PatientID?: number;
  User?: User;
  Patient?: Patient;
}
