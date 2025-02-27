import { AbstractControl, ValidationErrors } from '@angular/forms';

export const timeValidator = (timeHours: { startTime: string; endTime: string }[]) => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const index = timeHours.findIndex((t) => t.startTime === value || t.endTime === value);
    return index === -1 ? { invalidTime: true } : null;
  };
};

export const endTimeValidator = (timeHours: { startTime: string; endTime: string }[]) => {
  return (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.parent?.get('startTime')?.value;
    const endTime = control.value;

    if (!startTime || !endTime) {
      return null;
    }

    const startIndex = timeHours.findIndex((t) => t.startTime === startTime);
    const endIndex = timeHours.findIndex((t) => t.endTime === endTime);

    return endIndex >= startIndex ? null : { invalidTimeRange: true };
  };
};
