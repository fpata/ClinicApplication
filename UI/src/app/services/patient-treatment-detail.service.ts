import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientTreatmentDetail } from '../models/patient-treatment-detail.model';

@Injectable({ providedIn: 'root' })
export class PatientTreatmentDetailService {
  private apiUrl = '/api/PatientTreatmentDetail';

  constructor(private http: HttpClient) {}

  getAll(pageNumber = 1, pageSize = 10): Observable<PatientTreatmentDetail[]> {
    return this.http.get<PatientTreatmentDetail[]>(`${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  get(id: number): Observable<PatientTreatmentDetail> {
    return this.http.get<PatientTreatmentDetail>(`${this.apiUrl}/${id}`);
  }

  create(detail: PatientTreatmentDetail): Observable<PatientTreatmentDetail> {
    return this.http.post<PatientTreatmentDetail>(this.apiUrl, detail);
  }

  update(id: number, detail: PatientTreatmentDetail): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, detail);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
