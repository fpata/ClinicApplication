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
  IsActive?: number = 1;
  CreatedDate?: string = new Date().toISOString();
  CreatedBy?: number = 1;
  ModifiedDate?: string = new Date().toISOString();
  ModifiedBy?: number = 1;
  user?: User;
  PatientAppointments?: PatientAppointment[];
  PatientReports?: PatientReport[];
  PatientTreatment?: PatientTreatment;
}
