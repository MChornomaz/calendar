import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { AppRoutingModule } from './app.routes';
import { DBService } from './core/services/db/db.service';
import { firstValueFrom } from 'rxjs';

export function initDatabase(dbService: DBService): () => Promise<void> {
  return () => firstValueFrom(dbService.initDB());
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    HeaderComponent,
    SidebarComponent,
    MatIcon,
    MatMiniFabButton,
    MatButton,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initDatabase,
      deps: [DBService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
