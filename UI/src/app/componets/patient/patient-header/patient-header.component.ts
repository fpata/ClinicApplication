import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-header.component.html',
  styleUrls: ['./patient-header.component.css']
})
export class PatientHeaderComponent {
  @Input() patient: Patient | null = null;
  @Input() patientId: number | null = null;
  @Input() isNew: boolean = false;

  get displayName(): string {
    if (this.patient) {
      const first = this.patient.user.FirstName || '';
      const last = this.patient.user.LastName || '';
      const name = (first + ' ' + last).trim();
      return name.length ? name : 'Unknown Patient';
    }
    return this.isNew ? 'New Patient' : 'No Patient Selected';
  }
}
