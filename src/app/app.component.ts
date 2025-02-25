import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SidebarService} from './core/services/sidebar-service/sidebar.service';
import {DateRoutingService} from './core/services/date-routing-service/date-routing.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private sidebarService = inject(SidebarService);
  private dateRoutingService = inject(DateRoutingService);
  sidebarExpanded$ = this.sidebarService.expanded$;
  sidebarExpanded = signal<boolean>(true);

  constructor() {
    this.sidebarExpanded$.subscribe(expanded => this.sidebarExpanded.set(expanded));
    this.dateRoutingService.init()
  }
}
