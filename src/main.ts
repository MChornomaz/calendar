import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-US' }],
  })
  .catch((err) => console.error(err));
