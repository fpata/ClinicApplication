  export class PatientVitals {
    UserID: number;
    PatientID: number;
    RecordedDate: Date = new Date();
    BloodPressureSystolic?: number;
    BloodPressureDiastolic?: number;
    HeartRate?: number;
    Temperature?: number; // in Celsius
    Weight?: number; // in kg
    Height?: number; // in cm
    OxygenSaturation?: number;
    RespiratoryRate?: number;
    Notes?: string;
    RecordedBy: number;
  }