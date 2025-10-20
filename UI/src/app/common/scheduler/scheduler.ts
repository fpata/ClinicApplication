import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayPilotCalendarComponent, DayPilotModule } from '@daypilot/daypilot-lite-angular';
import { DayPilot } from '@daypilot/daypilot-lite-angular';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [CommonModule, DayPilotModule],
  templateUrl: './scheduler.html',
  styleUrls: ['./scheduler.css']
})
export class SchedulerComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendar!: DayPilotCalendarComponent;
  @Output() onNavigationChange = new EventEmitter<{ action: string, date: DayPilot.Date }>();
  calendarEvents: DayPilot.EventData[] = [];
  
  config: DayPilot.CalendarConfig = {
    startDate: DayPilot?.Date?.today()?.firstDayOfWeek(1),
    days: 6,
    businessBeginsHour: 9,
    businessEndsHour: 20,
    timeRangeSelectedHandling: 'Enabled',
    eventMoveHandling: 'Update',
    eventResizeHandling: 'Update',
    events: this.calendarEvents,
    onTimeRangeSelected: (args: any) => this.onTimeRangeSelected(args),
    onEventClick: (args: any) => this.onEventClick(args),
    onEventMoved: (args: any) => this.onEventMoved(args),
    onEventResized: (args: any) => this.onEventResized(args),
  };

  private readonly eventColors = ['#3c8dbc', '#00a65a', '#f56954', '#f39c12', '#9b59b6', '#34495e'];


  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    // Component view initialized
   
  }

  

  onEventClick(args: any): void {
    const eventDetails = `
Event: ${args.e.text()}
Resource: ${args.e.data.resource || 'N/A'}
Start: ${args.e.start().toString('yyyy-MM-dd h:mm tt')}
End: ${args.e.end().toString('yyyy-MM-dd h:mm tt')}
    `;
    alert(eventDetails);
  }

  onTimeRangeSelected(args: any): void {
    const name = prompt('New appointment:');
    if (name) {
      const resource = prompt('Resource (Doctor/Room):') || 'General';
      const randomColor = this.getRandomColor();

      const event = {
        id: DayPilot.guid(),
        start: args.start,
        end: args.end,
        text: name,
        resource: resource,
        backColor: randomColor
      };
      this.calendar.control.events.add(event);
    }
    this.calendar.control.clearSelection();
  }

  onEventMoved(args: any): void {
    console.log('Event moved:', args.e.text());
  }

  onEventResized(args: any): void {
    console.log('Event resized:', args.e.text());
  }

  editEvent(event: any): void {
    const newName = prompt('Edit appointment:', event.text());
    if (newName) {
      event.data.text = newName;
      this.calendar.control.events.update(event);
    }
  }

  deleteEvent(event: any): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.calendar.control.events.remove(event);
    }
  }

  addEvents(events: DayPilot.EventData[]): void {
    this.calendarEvents = events;
    this.calendar.config.events = this.calendarEvents || [];
    this.calendar.control.update(this.config);
  }

  /*addAppointment(): void {
    const name = prompt('Appointment name:');
    const resource = prompt('Resource (Doctor/Room):') || 'General';

    if (name) {
      const randomColor = this.getRandomColor();

      const event = {
        id: DayPilot.guid(),
        start: DayPilot.Date.today().addHours(9),
        end: DayPilot.Date.today().addHours(10),
        text: name,
        resource: resource,
        backColor: randomColor
      };
      this.calendar.control.events.add(event);
    }
  }*/

  navigateToToday(): void {
    this.config.startDate = DayPilot.Date.today();
    this.updateCalendar();
    this.onNavigationChange.emit({ 
      action: 'today',
      date: this.config.startDate
    });
  }

  navigateToPreviousDay(): void {
    const currentStart = new DayPilot.Date(this.config.startDate);
    this.config.startDate = currentStart.addDays(-1);
    this.updateCalendar();
    this.onNavigationChange.emit({ 
      action: 'previous-day',
      date: this.config.startDate
    });
  }

  navigateToNextDay(): void {
    const currentStart = new DayPilot.Date(this.config.startDate);
    this.config.startDate = currentStart.addDays(1);
    this.updateCalendar();
    this.onNavigationChange.emit({ 
      action: 'next-day',
      date: this.config.startDate
    });
  }

  navigateToPreviousWeek(): void {
    const currentStart = new DayPilot.Date(this.config.startDate);
    this.config.startDate = currentStart.addDays(-7);
    this.updateCalendar();
    this.onNavigationChange.emit({ 
      action: 'previous-week',
      date: this.config.startDate
    });
  }

  navigateToNextWeek(): void {
    const currentStart = new DayPilot.Date(this.config.startDate);
    this.config.startDate = currentStart.addDays(7);
    this.updateCalendar();
    this.onNavigationChange.emit({ 
      action: 'next-week',
      date: this.config.startDate
    });
  }

  switchToWeekView(): void {
    this.config.days = 7;
    this.updateCalendar();
  }

  switchToDayView(): void {
    this.config.days = 1;
    this.config.startDate = DayPilot.Date.today();
    this.updateCalendar();
  }

  switchToWorkWeekView(): void {
    this.config.days = 6;
    this.updateCalendar();
  }

  private getRandomColor(): string {
    return this.eventColors[Math.floor(Math.random() * this.eventColors.length)];
  }

  private updateCalendar(): void {
    this.config.events = this.calendarEvents;
    this.calendar.control.update(this.config);
  }
}