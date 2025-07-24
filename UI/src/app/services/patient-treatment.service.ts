import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientTreatment } from '../models/patient-treatment.model';

@Injectable({ providedIn: 'root' })
export class PatientTreatmentService {
  private apiUrl = '/api/PatientTreatment';

  constructor(private http: HttpClient) {}

  getAll(pageNumber = 1, pageSize = 10): Observable<PatientTreatment[]> {
    return this.http.get<PatientTreatment[]>(`${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  get(id: number): Observable<PatientTreatment> {
    return this.http.get<PatientTreatment>(`${this.apiUrl}/${id}`);
  }

  create(treatment: PatientTreatment): Observable<PatientTreatment> {
    return this.http.post<PatientTreatment>(this.apiUrl, treatment);
  }

  update(id: number, treatment: PatientTreatment): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, treatment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
