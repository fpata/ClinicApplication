import { Component } from '@angular/core';
import { AppConfigService } from '../../services/config.service';
import { AppConfig } from '../../models/appconfig.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-appconfig.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './appconfig.component.html',
  styleUrl: './appconfig.component.css'
})
export class AppconfigComponent {


  config: AppConfig;
  constructor(private configService: AppConfigService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.configService.getConfigs().subscribe((config: AppConfig) => {
      this.config = config;
    });
  }

  resetForm() {
    this.configService.getConfigs().subscribe((config: AppConfig) => {
      this.config = config;
    });
  }
  saveConfig() {
    if (this.config.ID === 0 || this.config.ID == null || this.config.ID === undefined) {
      this.configService.createConfig(this.config).subscribe(() => {
        this.messageService.success('Configuration saved successfully!');
      });
    } else {
      this.configService.updateConfig(this.config.ID, this.config).subscribe(() => {
        this.messageService.success('Configuration updated successfully!');
      });
    }
  }
}
  
