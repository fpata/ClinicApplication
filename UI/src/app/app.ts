import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "./componets/footer/footer";
import { Header } from "./componets/header/header";
import { MessagesComponent } from './common/messages/messages.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Header, MessagesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('clinicmanager_UI');
}
