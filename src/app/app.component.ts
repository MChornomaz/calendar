import { Component, inject, signal } from '@angular/core';
import { SidebarService } from './core/services/sidebar-service/sidebar.service';
import { DateRoutingService } from './core/services/date-routing-service/date-routing.service';
import { IAppointmentModalData } from './core/models/appointment-modal-data.interface';
import { AppointmentModalService } from './core/services/appointment-modal-service/appointment-modal.service';
import { DateChangeService } from './core/services/date-change-service/date-change.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private sidebarService = inject(SidebarService);
  private dateRoutingService = inject(DateRoutingService);
  private appointmentModalService = inject(AppointmentModalService);
  private dateChangeService = inject(DateChangeService);

  sidebarExpanded$ = this.sidebarService.expanded$;
  sidebarExpanded = signal<boolean>(true);
  currentDate$ = this.dateChangeService.currentDate$;
  currentDate = signal<Date | null>(null);

  constructor() {
    this.dateRoutingService.init();
    this.sidebarExpanded$.subscribe((expanded) => this.sidebarExpanded.set(expanded));
    this.currentDate$.subscribe((date) => {
      this.currentDate.set(date);
    });
  }

  createEvent() {
    const modalData: IAppointmentModalData = {
      type: 'create',
      data: {
        date: this.currentDate(),
      },
    };

    this.appointmentModalService.openAppointmentDialog(modalData).subscribe();
  }
}
