import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientSearchModel } from '../models/patient-search.model';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import { Contact } from '../models/contact.model';
import { Patient } from '../models/patient.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = `${environment.API_BASE_URL}/search` ;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: { [header: string]: string } } {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  }

  searchUser(model: PatientSearchModel): Observable<PatientSearchModel[]> {
    return this.http.post<PatientSearchModel[]>(`${this.apiUrl}/user`, model, this.getAuthHeaders());
  }

  advancedSearch(model: PatientSearchModel): Observable<{ Users: User[]; Addresses: Address[]; Contacts: Contact[]; Patients: Patient[] }> {
    return this.http.post<{ Users: User[]; Addresses: Address[]; Contacts: Contact[]; Patients: Patient[] }>(`${this.apiUrl}/advanced`, model, this.getAuthHeaders());
  }
}
