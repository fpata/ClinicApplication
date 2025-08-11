import { User } from './user.model';
import { Patient } from './patient.model';
import { PatientTreatmentDetail } from './patient-treatment-detail.model';
export class PatientTreatment {
  ID: number;
  UserID: number;
  ChiefComplaint: string;
  Observation?: string;
  TreatmentPlan: string;
  PatientID?: number;
  IsActive?: number = 1;
  CreatedDate?: string = new Date().toISOString();
  CreatedBy?: number = 1;
  ModifiedDate?: string = new Date().toISOString();
  ModifiedBy?: number = 1;
  TreatmentDate?: string = new Date().toISOString();
  user?: User;
  patient?: Patient;
  PatientTreatmentDetails?: PatientTreatmentDetail[];
}
