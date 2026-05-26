import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../../models/patient.model';
import { User } from '../../../models/user.model';
import { DataService } from '../../../services/data.service';
import { MessageService } from '../../../services/message.service';
import { PatientService } from '../../../services/patient.service';
import { PatientHeaderComponent } from '../patient-header/patient-header.component';
import { PatientBaseComponent } from '../patient-base.component';

@Component({
  selector: 'app-patient-history',
  imports: [FormsModule, PatientHeaderComponent],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientHistoryComponent extends PatientBaseComponent {

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
    this.patient = user?.Patients?.[0] as Patient ?? null;
  }

  /** Clear form: reload latest data from server */
  override onClear(): void {
    super.onClear();
  }

  /** Delete patient with confirmation */
  override onDelete(): void {
    super.onDelete();
  }

  onSave(): void {
    // TODO: Implement save logic for history
    console.log('History Save clicked');
  }
}
