import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, distinctUntilChanged, Subject, switchMap, take} from 'rxjs';
import {DateMode} from '../../models/date-mode';
import {ActivatedRoute} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DateChangeService {
  private currentDate$ = new BehaviorSubject<Date>(new Date());
  private dateMode$ = new BehaviorSubject<DateMode>('day');

  public currentDate = this.currentDate$.asObservable();
  public dateMode = this.dateMode$.asObservable();

  public changeDate(date: Date) {
    this.currentDate$.next(date);
  }
  public changeMode(mode: DateMode) {
    this.dateMode$.next(mode);
  }


  public incrementDate() {
    combineLatest([this.dateMode$, this.currentDate$]).pipe(
      distinctUntilChanged(([prevMode, prevDate], [currMode, currDate]) =>
        prevMode === currMode && prevDate.getTime() === currDate.getTime()
      ),
      take(1),
      switchMap(([mode, date]) => {
        const newDate = this.addTime(date, mode, 1);
        this.currentDate$.next(newDate);
        return this.currentDate$;
      })
    ).subscribe();
  }

  public decrementDate() {
    combineLatest([this.dateMode$, this.currentDate$]).pipe(
      distinctUntilChanged(([prevMode, prevDate], [currMode, currDate]) =>
        prevMode === currMode && prevDate.getTime() === currDate.getTime()
      ),
      take(1),
      switchMap(([mode, date]) => {
        const newDate = this.addTime(date, mode, -1);
        this.currentDate$.next(newDate);
        return this.currentDate$;
      })
    ).subscribe();
  }



  private addTime(date: Date, mode: DateMode, amount: number): Date {
    const newDate = new Date(date);

    switch (mode) {
      case 'day':
        newDate.setDate(newDate.getDate() + amount);
        break;

      case 'week':
        newDate.setDate(newDate.getDate() + amount * 7);
        break;

      case 'month':
        newDate.setMonth(newDate.getMonth() + amount);
        if (newDate.getDate() !== date.getDate()) {
          newDate.setDate(0);
        }
        break;

      case 'year':
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
    }

    return newDate;
  }
}
