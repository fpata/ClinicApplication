import { DataService } from "../services/data.service";
import { UtilityService } from "../services/utility.service";
import { BaseEntity } from "./base.model";

  export class PatientVitals extends BaseEntity {

    constructor(private util:UtilityService, private dataService:DataService) { 
      super();
      this.RecordedDate = this.util.formatDate(new Date());
      this.RecordedBy = this.dataService.getLoginUser()?.user?.ID || 0;
    }
    UserID: number;
    PatientID: number;
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