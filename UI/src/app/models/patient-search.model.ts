import { UtilityService } from "../services/utility.service";

export class PatientSearchModel {

  constructor(private util: UtilityService) {
    this.StartDate = this.util.formatDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'); // Default to 365 days ago
    this.EndDate = this.util.formatDate(new Date(), 'yyyy-MM-dd');
  }
  PatientID?: number = 0;
  UserID?: number = 0;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  UserType?: string;
  PrimaryPhone?: string;
  PrimaryEmail?: string;
  PermCity?: string;
  DoctorID?: number =0; // Optional field for doctor ID
  DoctorName?: string; // Optional field for doctor name
  EndDate?: string; // set externally via UtilityService
  StartDate?: string;  // Default to 365 days ago
}
