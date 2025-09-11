import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { DataService } from './data.service';
import { UtilityService } from './utility.service';
import { PatientTreatment } from '../models/patient-treatment.model';
import { PatientAppointment } from '../models/patient-appointment.model';
import { PatientReport } from '../models/patient-report.model';
import { PatientVitals } from '../models/patient-vitals.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly apiUrl = `${environment.API_BASE_URL}/patient`;

  constructor(private http: HttpClient, private dataService: DataService, private util: UtilityService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getCompletePatient(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/Complete/${id}`, { headers: this.getAuthHeaders() });
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient, { headers: this.getAuthHeaders() });
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient, { headers: this.getAuthHeaders() });
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

   AddNewPatient() {
   
    var patient: Patient = new Patient();
    patient.UserID = this.dataService.getUser()?.ID || 0;
    
    patient.ID = 0; // New patient, so ID is 0
    patient.CreatedBy = this.dataService.getLoginUser()?.user?.ID || 0;
    patient.ModifiedBy = this.dataService.getLoginUser()?.user?.ID || 0;
    patient.CreatedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    patient.ModifiedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    patient.IsActive = 1;
    patient.UserID = this.dataService.getUser()?.ID || 0;
    patient.PatientVitals = new Array<PatientVitals>(new PatientVitals());
    patient.PatientVitals[0].PatientID = patient.ID;
    patient.PatientVitals[0].UserID = patient.UserID;
    patient.PatientAppointments = new Array<PatientAppointment>(new PatientAppointment());
    patient.PatientAppointments[0].PatientID = patient.ID;
    patient.PatientAppointments[0].UserID = patient.UserID;
    patient.PatientTreatment = new PatientTreatment();
    patient.PatientTreatment.PatientID = patient.ID;
    patient.PatientTreatment.UserID = patient.UserID;
    patient.PatientReports = new Array<PatientReport>(new PatientReport());
    patient.PatientReports[0].PatientID = patient.ID;
    patient.PatientReports[0].UserID = patient.UserID;
    this.dataService.setPatient(patient);
  }
}
