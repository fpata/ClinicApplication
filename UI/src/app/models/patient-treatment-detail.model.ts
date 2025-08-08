import { User } from './user.model';
import { PatientTreatment } from './patient-treatment.model';
export class PatientTreatmentDetail {
  ID: number;
  PatientTreatmentID: number;
  UserID?: number;
  Tooth?: string;
  Procedure?: string;
  Advice?: string;
  TreatmentDate?: string;
  PatientID?: number;
  IsActive?: boolean = true;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string;
  ModifiedBy?: number;
  user?: User;
  patientTreatment?: PatientTreatment;
}
