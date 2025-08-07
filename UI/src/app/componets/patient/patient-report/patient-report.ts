import { Component } from '@angular/core';
import { PatientReport } from '../../../models/patient-report.model';
import { User } from '../../../models/user.model';
import { DataService } from '../../../services/data.service';
import { Subscription } from 'rxjs';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-report',
  imports: [],
  templateUrl: './patient-report.html',
  styleUrl: './patient-report.css'
})
export class PatientReportComponent {

  reports: PatientReport[] = []; // Initialize reports array
  private patientSubscription: Subscription = new Subscription();
  patient: Patient | null = null;

  constructor(private dataService: DataService) { }
  
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

  EditReport(reportId: number) {
    document.getElementById("btnAddReport")?.click();

    var report: PatientReport = this.reports.find(x => x.ID == reportId) as PatientReport;
    (document.getElementById('txtReportFinding') as HTMLInputElement).value = report.ReportDetails || '';
    (document.getElementById('txtDoctorName') as HTMLInputElement).value = report.DoctorName;
    (document.getElementById('txtReportName') as HTMLInputElement).value = report.ReportName;
    var strDate = report.ReportDate ? new Date(report.ReportDate).toISOString().split('T')[0] : '';
    (document.getElementById('txtReportDate') as HTMLInputElement).value = strDate;
    (document.getElementById('hdReportId') as HTMLInputElement).value = report.ID.toString();
  }
  DeleteReport(reportId: number) {
    var reportIndex = this.reports.findIndex(x => x.ID === reportId);
    this.reports.splice(reportIndex, 1);
  }
  SaveReport() {
    var report: PatientReport = { ID: 0, ReportDetails: '', DoctorName: '', ReportName: '', ReportDate: '' };
    var reportId = (document.getElementById('hdReportId') as HTMLInputElement).value;
    var IsEdit: boolean = false;
    ///is EditOperation
    if (!(reportId == undefined || reportId == '')) {
      var rptId = Number.parseInt(reportId)
      report = this.reports.find(x => x.ID == rptId) as PatientReport;
      IsEdit = true;
    }
    else {
      if (this.reports == undefined || this.reports == null) {
        this.reports = new Array<PatientReport>();
        report.ID = -1;
      }
      else {
        report.ID = (Math.min(...this.reports.map(x => x.ID)) + (-1));
      }
    }
    report.ReportDetails = (document.getElementById('txtReportFinding') as HTMLInputElement).value;
    report.DoctorName = (document.getElementById('txtDoctorName') as HTMLInputElement).value;
    report.ReportName = (document.getElementById('txtReportName') as HTMLInputElement).value;
    var dtStringValue = (document.getElementById('txtReportDate') as HTMLInputElement).value;
    if (dtStringValue == undefined || dtStringValue == '') {
      dtStringValue = new Date().toISOString().split('T')[0]; // Default to today's date if not provided  
    } else {
      dtStringValue = (new Date(dtStringValue)).toISOString().split('T')[0];
    }
    report.ReportDate = dtStringValue;
    if (!IsEdit) {
      this.reports.push(report);
    }
  }
}