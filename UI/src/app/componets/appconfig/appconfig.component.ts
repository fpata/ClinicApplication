import { Component } from '@angular/core';
import { AppConfigService } from '../../services/config.service';
import { AppConfig } from '../../models/appconfig.model';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-appconfig.component',
  imports: [FormsModule],
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
    this.config = { ...this.config };
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
  
