import { Component, signal } from '@angular/core';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ClinicManager_UI');
}
