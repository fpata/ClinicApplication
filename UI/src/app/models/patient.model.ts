import { User } from './user.model';
import { PatientAppointment } from './patient-appointment.model';
import { PatientReport } from './patient-report.model';
import { PatientTreatment } from './patient-treatment.model';
export class Patient {
  ID: number;
  UserID?: number;
  Allergies: string;
  Medications?: string;
  FatherHistory?: string;
  MotherHistory?: string;
  IsActive?: boolean;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string;
  ModifiedBy?: number;
  user?: User;
  PatientAppointments?: PatientAppointment[];
  PatientReports?: PatientReport[];
  PatientTreatment?: PatientTreatment;
}
