import { User } from './user.model';
import { Patient } from './patient.model';
import { PatientTreatmentDetail } from './patient-treatment-detail.model';
export interface PatientTreatment {
  ID: number;
  UserID: number;
  ChiefComplaint: string;
  Observation?: string;
  TreatmentPlan: string;
  PatientID?: number;
  IsActive?: boolean;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string;
  ModifiedBy?: number;
  TreatmentDate?: string;
  user?: User;
  patient?: Patient;
  details?: PatientTreatmentDetail[];
}
