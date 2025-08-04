import { Component } from '@angular/core';

import { DataService } from '../../services/data.service';
import { LoginResponse } from '../../services/login.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
 loginUser: LoginResponse | null = null;
  constructor(private dataService: DataService ) {}

 ngOnInit() {
    this.dataService.$loginUser.subscribe(user => {
      this.loginUser = user;
    });
  }

  ngonDestroy() {
    this.dataService.$loginUser.unsubscribe();
  }
  
  logout() {
    localStorage.removeItem('token');
    this.dataService.setLoginUser(null);
    this.loginUser = null;
  }
}
