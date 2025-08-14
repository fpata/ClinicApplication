import { Component, ViewChild, viewChild } from '@angular/core';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/user.model';
import { SchedulerComponent } from "../../../common/scheduler/scheduler";
import { DayPilotModule, DayPilot } from '@daypilot/daypilot-lite-angular';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-appointment',
  imports: [SchedulerComponent, DayPilotModule, FormsModule],
  templateUrl: './patient-appointment.html',
  styleUrls: ['./patient-appointment.css']
})
export class PatientAppointmentComponent {


  @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;

  patient: Patient | null = null;
  appointments: PatientAppointment[] | null = [];
  newAppointment: PatientAppointment = new PatientAppointment();
  // Subscription to handle patient changes
  private patientSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService) { }

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (_newPatient: Patient) => {
        this.patient = _newPatient;
        if (_newPatient && _newPatient.PatientAppointments && _newPatient.PatientAppointments.length > 0) {
          this.appointments = _newPatient.PatientAppointments;
        } else {
          this.appointments = [];
        }
        if (this.scheduler && this.appointments && this.appointments.length > 0) {
          this.AddEventsToScheduler(this.appointments);
          console.log('Events added to scheduler:');
          // Pass the appointments to the scheduler component

        }
        console.log('Patient updated:', _newPatient);
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

  AddEventsToScheduler(appointments: PatientAppointment[]) {
    var events: DayPilot.EventData[] = [];
    appointments.forEach(appointment => {
      events.push({
        id: appointment.ID.toString(),
        text: appointment.PatientName || 'Unknown Patient',
        start: new DayPilot.Date(appointment.StartApptDate),
        end: new DayPilot.Date(appointment.EndApptDate),
        resource: appointment.DoctorName || 'General',
        backColor: '#3c8dbc',
      });
    });
    this.scheduler.addEvents(events);
  }

  EditAppointment(appointmentID: number) {
    const appointment = this.appointments.find(a => a.ID === appointmentID);
    if (appointment) {
      this.newAppointment = { ...appointment };
    }
  }

  DeleteAppointment(appointmentID: number) {
    this.appointments = this.appointments.filter(a => a.ID !== appointmentID);
    this.scheduler.deleteEvent(appointmentID.toString());
    this.patient.PatientAppointments = this.appointments;
    this.dataService.setPatient(this.patient);
  }

  SaveAppointment() {
    // Implement save logic here
    const appointmentTime = (document.getElementById('txtAppointmentTime') as HTMLInputElement)?.value;
    const appointmentEndTime = (document.getElementById('txtAppointmentEndTime') as HTMLInputElement)?.value;
    
    if (this.newAppointment.StartApptDate && appointmentTime) {
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startDate = new Date(this.newAppointment.StartApptDate);
      startDate.setHours(hours, minutes, 0, 0);
      this.newAppointment.StartApptDate = startDate;
    }

    if (this.newAppointment.EndApptDate && appointmentEndTime) {
      const [hours, minutes] = appointmentEndTime.split(':').map(Number);
      // Assuming EndApptDate should be on the same day as StartApptDate
      const endDate = new Date(this.newAppointment.StartApptDate); 
      endDate.setHours(hours, minutes, 0, 0);
      this.newAppointment.EndApptDate = endDate;
    }

    if (this.newAppointment.ID < 1) {
      this.appointments.push({ ...this.newAppointment });

    } else {
      const index = this.appointments.findIndex(a => a.ID === this.newAppointment.ID);
      if (index > -1) {
        this.appointments[index] = { ...this.newAppointment };
      }
    }
    this.AddEventsToScheduler(this.appointments);
    this.patient.PatientAppointments = this.appointments;
    this.dataService.setPatient(this.patient);
  }

  AddAppointment() {
    var user = this.dataService.getUser();
    this.newAppointment = new PatientAppointment();
    this.newAppointment.ID = this.appointments.length > 0 ? Math.min(...this.appointments.map(a => a.ID)) - 1 : 0; // Initialize new appointment ID
    this.newAppointment.PatientID = this.patient?.ID || 1;
    this.newAppointment.UserID = user?.ID || 1;
    this.newAppointment.StartApptDate = new Date();
    this.newAppointment.EndApptDate = new Date(new Date().getTime() + 30 * 60000); // Default to 30 minutes later
    this.newAppointment.DoctorName = '';
    this.newAppointment.TreatmentName = '';
    this.newAppointment.PatientName = user?.FirstName + ' ' + user?.LastName || 'Unknown Patient';
    this.newAppointment.IsActive = 1;
    this.newAppointment.CreatedBy = user?.ID || 1;
    this.newAppointment.ModifiedBy = user?.ID || 1;
    this.newAppointment.CreatedDate = new Date().toISOString();
    this.newAppointment.ModifiedDate = new Date().toISOString();
    this.newAppointment.DoctorID = this.dataService.getLoginUser()?.user?.ID || 1;
  }
}