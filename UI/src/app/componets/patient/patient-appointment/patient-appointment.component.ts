import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { MessageService } from '../../../services/message.service';
import { PatientService } from '../../../services/patient.service';
import { PatientBaseComponent } from '../patient-base.component';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { AppointmentHelper } from '../../../common/appointment-helper';
import { Patient } from '../../../models/patient.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-patient-appointment',
  imports: [DashboardComponent],
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientAppointmentComponent extends PatientBaseComponent implements OnInit {

  constructor(
    dataService: DataService,
    patientService: PatientService,
    messageService: MessageService,
    router: Router,
    cdr: ChangeDetectorRef
  ) {
    super(dataService, patientService, messageService, router, cdr);
  }

  ngOnInit(): void {
    this.initPatientSubscription();
  }

  protected applyUserData(user: User): void {
    if (!user) { this.router.navigate(['/dashboard']); return; }
    if (!user.Patients?.length) { this.router.navigate(['/patient/search']); return; }

    this.patient = user.Patients[0] as Patient;
    this.cdr.markForCheck();
  }

  displayName(d: any): string {
    return AppointmentHelper.displayName(d);
  }

  /** Clear form: reload latest data from server */
  override onClear(): void {
    super.onClear();
  }

  /** Delete patient with confirmation */
  override onDelete(): void {
    super.onDelete();
  }
}