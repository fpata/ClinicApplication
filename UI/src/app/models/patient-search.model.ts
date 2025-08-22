import { UtilityService } from "../services/utility.service";

export class PatientSearchModel {

  constructor(private util: UtilityService) {
      // Make util non-enumerable so it won't appear in JSON
    Object.defineProperty(this, 'util', { enumerable: false });
    this.StartDate = this.util.formatDate(new Date((Date.now() - 365 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd');
    this.EndDate = this.util.formatDate(new Date((Date.now() + 180 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd');
  }

  PatientID?: number = 0;
  UserID?: number = 0;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  // Change to number (nullable) to match backend enum underlying type
  UserType?: number | null;
  PrimaryPhone?: string;
  PrimaryEmail?: string;
  PermCity?: string;
  DoctorID?: number = 0;
  DoctorName?: string;
  EndDate?: string;
  StartDate?: string;

  // Ensure only relevant properties are serialized
  toJSON() {
    const {
      PatientID, UserID, FirstName, LastName, UserName,
      UserType, PrimaryPhone, PrimaryEmail, PermCity,
      DoctorID, DoctorName, EndDate, StartDate
    } = this;
    return {
      PatientID,
      UserID,
      FirstName,
      LastName,
      UserName,
      UserType: UserType === undefined ? null : UserType,
      PrimaryPhone,
      PrimaryEmail,
      PermCity,
      DoctorID,
      DoctorName,
      EndDate,
      StartDate
    };
  }
}
