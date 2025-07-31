import { Routes } from '@angular/router';

import { LoginComponent } from './componets/login/login';
import { PatientMasterComponent } from './componets/patient/patient-master/patient-master';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {path: 'patient', component: PatientMasterComponent },
  // Add other routes here
];
