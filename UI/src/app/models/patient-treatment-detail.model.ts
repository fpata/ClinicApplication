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
  IsActive?: number = 1;
  CreatedDate?: string = new Date().toISOString();
  CreatedBy?: number = 1;
  ModifiedDate?: string = new Date().toISOString();
  ModifiedBy?: number = 1;
  user?: User;
  patientTreatment?: PatientTreatment;
}
