import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

registerLocaleData(localeEs);



bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
/*bootstrapApplication(App, {
  providers: [
    importProvidersFrom(),
    provideHttpClient(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'es-PE' }
  ]
}); */
