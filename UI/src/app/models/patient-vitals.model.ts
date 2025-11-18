import { DataService } from "../services/data.service";
import { UtilityService } from "../services/utility.service";
import { BaseEntity } from "./base.model";

  export class PatientVitals extends BaseEntity {

    constructor() { 
      super();
    }
    
    UserID: number=0;
    PatientID: number =0;
    RecordedDate: String;
    BloodPressureSystolic?: number;
    BloodPressureDiastolic?: number;
    HeartRate?: number;
    Temperature?: number; // in Celsius
    Weight?: number; // in kg
    Height?: number; // in cm
    OxygenSaturation?: number;
    RespiratoryRate?: number;
    Notes?: string;
    RecordedBy?: number;
    BloodType?: string;
  }