import { Component } from '@angular/core';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-forgotpassword.component',
  imports: [],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})
export class ForgotPasswordComponent {
  constructor(private messageService: MessageService) { }

resetPassword() {
  var emailValue = (document.getElementById('email') as HTMLInputElement).value;
  var mobileValue = (document.getElementById('mobile') as HTMLInputElement).value;
  if(emailValue.trim() === '' && mobileValue.trim() === '') {
    this.messageService.error('Email and mobile fields both cannot be empty.');
    return;
  }
  if(emailValue.trim() !== ''  && !this.validateEmail()) {
    this.messageService.error('Please enter a valid email address.');
    return;
  }
  const email = (document.getElementById('email') as HTMLInputElement).value;
  this.messageService.info('Password reset link sent to ' + email);
  this.messageService.sendMessage('Password reset link sent to ' + email);
}
      validateEmail() {
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
      }

}
