import { inject, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DateChangeService } from '../date-change-service/date-change.service';
import { DateMode } from '../../models/date-mode';
import { combineLatest, distinctUntilChanged, filter, first, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DateRoutingService implements OnDestroy {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private dateChangeService = inject(DateChangeService);

  private subscriptions: Subscription = new Subscription();
  private isInitialSyncDone = false;

  public init() {
    this.syncDateFromUrl();
  }

  private syncDateFromUrl() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        first(),
      )
      .subscribe(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }

        const hasYearParam = route.snapshot.paramMap.has('year');
        const { mode, date } = this.parseRoute(route);
        if (!hasYearParam) {
          const initialDate = new Date();
          const url = this.generateUrl(mode, initialDate);
          this.router.navigateByUrl(url, { replaceUrl: true });
          this.dateChangeService.initializeDate(initialDate);
        } else {
          this.dateChangeService.initializeDate(date);
          this.dateChangeService.changeMode(mode);
        }

        this.dateChangeService.changeMode(mode);
        this.isInitialSyncDone = true;
        this.syncDateToUrl();
      });
  }

  private syncDateToUrl() {
    const sub = combineLatest([this.dateChangeService.dateMode$, this.dateChangeService.currentDate$])
      .pipe(
        filter(() => this.isInitialSyncDone),
        distinctUntilChanged(([prevMode, prevDate], [currMode, currDate]) => {
          return prevMode === currMode && prevDate?.getTime() === currDate?.getTime();
        }),
      )
      .subscribe(([mode, date]) => {
        if (date) {
          this.updateUrl(mode || 'day', date);
        }
      });

    this.subscriptions.add(sub);
  }

  private parseRoute(route: ActivatedRoute): { mode: DateMode; date: Date } {
    const mode = (route.snapshot.parent?.url[0]?.path as DateMode) || 'day';
    const year = +(route.snapshot.paramMap.get('year') || new Date().getFullYear());
    const month = +(route.snapshot.paramMap.get('month') || new Date().getMonth() + 1);
    const day = +(route.snapshot.paramMap.get('day') || new Date().getDate());

    return { mode, date: new Date(year, month - 1, day) };
  }

  private updateUrl(mode: DateMode, date: Date) {
    const url = this.generateUrl(mode, date);
    this.router.navigateByUrl(url, { replaceUrl: true });
  }

  private generateUrl(mode: DateMode, date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    switch (mode) {
      case 'day':
        return `/day/${year}/${month}/${day}`;
      case 'week':
        return `/week/${year}/${month}/${day}`;
      case 'month':
        return `/month/${year}/${month}/${day}`;
      case 'year':
        return `/year/${year}/${month}/${day}`;
      default:
        return '/day';
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
