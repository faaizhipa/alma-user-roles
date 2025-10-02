import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AlertModule,
  CloudAppTranslateModule,
  MaterialModule,
} from '@exlibris/exl-cloudapp-angular-lib';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { LoaderComponent } from './components/loader/loader.component';
import { MainComponent } from './components/main/main.component';
import { CSVProcessorComponent } from './components/csv-processor/csv-processor.component';
import { ProcessingResultsComponent } from './components/processing-results/processing-results.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ConfigurationComponent,
    LoaderComponent,
    CSVProcessorComponent,
    ProcessingResultsComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,
    CloudAppTranslateModule.forRoot(),
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
