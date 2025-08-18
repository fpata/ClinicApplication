import { Component } from '@angular/core';
import { PatientReport } from '../../../models/patient-report.model';
import { User } from '../../../models/user.model';
import { DataService } from '../../../services/data.service';
import { UtilityService } from '../../../services/utility.service';
import { Subscription } from 'rxjs';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-patient-report',
  imports: [FormsModule],
  templateUrl: './patient-report.component.html',
  styleUrls: ['./patient-report.component.css']
})
export class PatientReportComponent {

  reports: PatientReport[] = [];
  private patientSubscription: Subscription = new Subscription();
  patient: Patient | null = null;
  newReport: PatientReport|null = null; // Initialize new report object
  
  constructor(private dataService: DataService, private util: UtilityService) {
   }
  
  ngOnInit() {
    // Subscribe to user changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (newPatient: Patient) => {
        this.patient = newPatient;
        if (newPatient && newPatient.PatientReports && newPatient.PatientReports.length > 0) {
          this.reports = newPatient.PatientReports || []; // Assuming Reports is part of the patient model
        }
        else {
          this.reports = []; // Ensure reports is initialized to an empty array if no reports are
        }
        console.log('Patient updated:', newPatient);
      },
      error: (error) => {
        console.error('Error subscribing to patient changes:', error);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.patientSubscription) {
      this.patientSubscription.unsubscribe();
    }
  }

  AddReport() {
    var user: User | null = this.dataService.getUser();
    this.newReport = <PatientReport>  {
      ID: this.reports.length > 0 ? Math.min(...this.reports.map(r => r.ID)) - 1 : 0,
      UserID: user?.ID || 0,
      PatientID: this.patient?.ID || 0,
      IsActive :1,
      ReportDate: new Date().toString().split('T')[0],
      ReportName: '',
      DoctorName: '',
      ReportDetails: '',
      CreatedBy: user?.ID || 0,
      ModifiedBy: user?.ID || 0,
  ModifiedDate: this.util.formatDate(new Date(), 'yyyy-MM-dd'),
  CreatedDate: this.util.formatDate(new Date(), 'yyyy-MM-dd') 
    };
  }

  EditReport(reportId: number) {
    this.newReport = <PatientReport>this.reports.find(x => x.ID === reportId);
  }

  DeleteReport(reportId: number) {
    var reportIndex = this.reports.findIndex(x => x.ID === reportId);
    this.reports.splice(reportIndex, 1);
    // Update the patient reports in the data service
    this.patient.PatientReports = this.reports;
    this.dataService.setPatient(this.patient);
  }

  SaveReport() {
    if (this.newReport) {
      // Check if the report already exists
      const existingReportIndex = this.reports.findIndex(r => r.ID === this.newReport.ID);
      if (existingReportIndex > -1) {
        // Update existing report
        this.reports[existingReportIndex] = { ...this.newReport };
      } else {
        // Add new report
        this.reports.push({ ...this.newReport });
      }
      // Reset new report object
      this.newReport = null;
      this.patient.PatientReports = this.reports; // Update the patient reports in the data service
      this.dataService.setPatient(this.patient);
    }
  }


}