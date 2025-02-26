import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private expanded = new BehaviorSubject<boolean>(true);
  expanded$ = this.expanded.asObservable();

  public toggleExpanded() {
    this.expanded.next(!this.expanded.value);
  }
}
