import { NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    return value ? new Date(value) : null;
  }

  override format(date: Date, displayFormat: Object): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', // Назва дня
      year: 'numeric', // Рік
      month: 'long', // Місяць
      day: 'numeric', // День місяця
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}
