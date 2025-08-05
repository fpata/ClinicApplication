export class PatientSearchModel {

  constructor() {}
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
  EndDate?: string = new Date().toISOString().split('T')[0];
  StartDate?: string = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  ; // Default to 365 days ago
}
