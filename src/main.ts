import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // O app.component.ts según se llame tu archivo

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
