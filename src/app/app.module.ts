import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {CoreModule} from './core/core.module';
import {SharedModule} from './shared/shared.module';
import {RouterModule} from '@angular/router';
import {HeaderComponent} from './shared/components/header/header.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SidebarComponent} from './shared/components/sidebar/sidebar.component';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {AppRoutingModule} from './app.routes';

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
    AppRoutingModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
