import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { PatientService } from '../../../services/patient.service';
import { MessageService } from '../../../services/message.service';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-clinical-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clinical-reports.component.html',
  styleUrl: './clinical-reports.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicalReportsComponent implements OnInit {
  patients: Patient[] = [];

  // Medical History
  historyPatientId: number | null = null;
  isHistoryLoading = false;

  // Referral Letter
  referralPatientId: number | null = null;
  referralDoctorName = '';
  referralClinicName = '';
  referralReason = '';
  isReferralLoading = false;

  constructor(
    private reportService: ReportService,
    private patientService: PatientService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching patients for reporting:', err);
        this.messageService.error('Could not load patients list.');
      }
    });
  }

  downloadMedicalHistory(): void {
    if (!this.historyPatientId) {
      this.messageService.warn('Please select a patient.');
      return;
    }

    this.isHistoryLoading = true;
    this.cdr.markForCheck();

    const patId = Number(this.historyPatientId);
    this.reportService.downloadMedicalHistory(patId).subscribe({
      next: (blob) => {
        this.saveBlob(blob, `medical_history_patient_${patId}.rtf`);
        this.messageService.success('Medical history document generated successfully.');
        this.isHistoryLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Medical history error:', err);
        this.messageService.error('Failed to generate medical history document.');
        this.isHistoryLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  downloadReferral(): void {
    if (!this.referralPatientId) {
      this.messageService.warn('Please select a patient.');
      return;
    }
    if (!this.referralDoctorName.trim()) {
      this.messageService.warn('Please enter the specialist\'s name.');
      return;
    }
    if (!this.referralClinicName.trim()) {
      this.messageService.warn('Please enter the destination clinic/hospital name.');
      return;
    }
    if (!this.referralReason.trim()) {
      this.messageService.warn('Please state a reason for referral.');
      return;
    }

    this.isReferralLoading = true;
    this.cdr.markForCheck();

    const patId = Number(this.referralPatientId);
    this.reportService.downloadReferralLetter(
      patId,
      this.referralDoctorName,
      this.referralClinicName,
      this.referralReason
    ).subscribe({
      next: (blob) => {
        this.saveBlob(blob, `referral_letter_patient_${patId}.rtf`);
        this.messageService.success('Referral letter template generated successfully.');
        this.isReferralLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Referral letter error:', err);
        this.messageService.error('Failed to generate referral letter.');
        this.isReferralLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  clearReferralFilters(): void {
    this.referralPatientId = null;
    this.referralDoctorName = '';
    this.referralClinicName = '';
    this.referralReason = '';
    this.cdr.markForCheck();
  }

  private saveBlob(blob: Blob, defaultFilename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
