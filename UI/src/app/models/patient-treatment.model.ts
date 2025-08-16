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
  CreatedDate?: string; // set via UtilityService
  CreatedBy?: number = 1;
  ModifiedDate?: string; // set via UtilityService
  ModifiedBy?: number = 1;
  TreatmentDate?: string = new Date().toString();
  user?: User;
  patient?: Patient;
  PatientTreatmentDetails?: PatientTreatmentDetail[];
}
