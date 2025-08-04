import { Routes } from '@angular/router';

import { LoginComponent } from './componets/login/login';
import { PatientMasterComponent } from './componets/patient/patient-master/patient-master';
import { SchedulerComponent } from './common/scheduler/scheduler';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'patient', component: PatientMasterComponent },
  { path: 'scheduler', component: SchedulerComponent },
  { path: '', redirectTo: '/scheduler', pathMatch: 'full' },
  // Add other routes here
];
