import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
  calendarEvents: DayPilot.Event[] = [];
  config: DayPilot.CalendarConfig = {
    startDate: DayPilot.Date.today(),
    days: 7,
    businessBeginsHour: 9,
    businessEndsHour: 20,
    timeRangeSelectedHandling: 'Enabled',
    eventMoveHandling: 'Update',
    eventResizeHandling: 'Update',
    events:[],
    onTimeRangeSelected: (args: any) => {
      this.onTimeRangeSelected(args);
    },
    onEventClick: (args: any) => {
      this.onEventClick(args);
    },
    onEventMoved: (args: any) => {
      this.onEventMoved(args);
    },
    onEventResized: (args: any) => {
      this.onEventResized(args);
    }
  };


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
Start: ${args.e.start().toString('M/d/yyyy h:mm tt')}
End: ${args.e.end().toString('M/d/yyyy h:mm tt')}
    `;
    alert(eventDetails);
  }

  onTimeRangeSelected(args: any): void {
    const name = prompt('New appointment:');
    if (name) {
      const resource = prompt('Resource (Doctor/Room):') || 'General';
      const colors = ['#3c8dbc', '#00a65a', '#f56954', '#f39c12', '#9b59b6', '#34495e'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
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

  addEvents(events:DayPilot.Event[]):void {
    this.calendar.control.events.list = [];
    events.forEach(event => {
      this.calendar.control.events.add(event);
    });
  }

  addAppointment(): void {
    const name = prompt('Appointment name:');
    const resource = prompt('Resource (Doctor/Room):') || 'General';
    
    if (name) {
      const colors = ['#3c8dbc', '#00a65a', '#f56954', '#f39c12', '#9b59b6', '#34495e'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
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
  }

  navigateToToday(): void {
    this.config.startDate = DayPilot.Date.today();
    this.calendar.control.update(this.config);
    this.addEvents(this.calendarEvents);
  }

  navigateToPrevious(): void {
    const currentStart = new DayPilot.Date(this.config.startDate);
    this.config.startDate = currentStart.addDays(-7);
    this.calendar.control.update(this.config);
  }

  navigateToNext(): void {
    const currentStart = new DayPilot.Date(this.config.startDate);
    this.config.startDate = currentStart.addDays(7);
    this.calendar.control.update(this.config);
  }

  switchToWeekView(): void {
    this.config.days = 7;
    this.calendar.control.update(this.config);
  }

  switchToDayView(): void {
    this.config.days = 1;
    this.calendar.control.update(this.config);
  }

  switchToWorkWeekView(): void {
    this.config.days = 5;
    this.calendar.control.update(this.config);
  }
}
/*
events: [
      {
        id: '1',
        start: DayPilot.Date.today().addHours(9),
        end: DayPilot.Date.today().addHours(10),
        text: 'Patient Consultation - John Doe',
        resource: 'Dr. Smith',
        backColor: '#3c8dbc'
      },
      {
        id: '2',
        start: DayPilot.Date.today().addHours(11),
        end: DayPilot.Date.today().addHours(12),
        text: 'Patient Consultation - Jane Smith',
        resource: 'Dr. Smith',
        backColor: '#00a65a'
      },
      {
        id: '3',
        start: DayPilot.Date.today().addHours(10),
        end: DayPilot.Date.today().addHours(11),
        text: 'Surgery - Michael Johnson',
        resource: 'Dr. Johnson',
        backColor: '#f56954'
      }
    ]
*/