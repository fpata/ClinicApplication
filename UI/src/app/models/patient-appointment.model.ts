import { User } from './user.model';
import { Patient } from './patient.model';
import { BaseEntity } from './base.model';
import { Time } from '@angular/common';

export class PatientAppointment extends BaseEntity {
  UserID?: number;
  StartDateTime: Date = new Date();
  EndDateTime?: Date;
  TreatmentName?: string;
  DoctorID?: number;
  DoctorName?: string;
  AppointmentStatus?: string;
  PatientID?: number;
  PatientName?: string;
  user?: User;
  doctor?: User;
  patient?: Patient;
  Notes: string;

  CheckInTime?: Time;
  CheckOutTime?: Time;

  CancellationReason?: string;

  ReminderSentDate?: Date;
}
