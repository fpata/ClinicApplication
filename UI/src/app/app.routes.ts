import { Routes } from '@angular/router';
import { LoginComponent } from './componets/login/login';
import { PatientMasterComponent } from './componets/patient/patient-master/patient-master';
import { SchedulerComponent } from './common/scheduler/scheduler';
import { Dashboard } from './componets/dashboard/dashboard';
import { DoctorAppointmentsComponent } from './componets/doctor/doctorappointments/doctorappointments';
import { PatientCompleteHistoryComponent } from './componets/patient/patientcompletehistory/patientcompletehistory';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'patient', component: PatientMasterComponent },
  { path: 'scheduler', component: SchedulerComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'doctorAppointments', component: DoctorAppointmentsComponent },
  { path : 'patienthistory', component: PatientCompleteHistoryComponent },
  // Add other routes here
];
