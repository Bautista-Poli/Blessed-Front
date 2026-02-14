// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'shop', loadComponent: () =>
      import('./shop/shop').then(m => m.Shop) },
];
