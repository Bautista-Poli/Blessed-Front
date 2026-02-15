// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./inicio/inicio').then(m => m.Inicio) 
  },
  { 
    path: 'shop', 
    loadComponent: () => import('./shop/shop').then(m => m.Shop) 
  },
  { 
    path: 'catalog', 
    loadComponent: () => import('./catalog/catalog').then(m => m.Catalogo) 
  },
  { 
    path: 'drop1', 
    loadComponent: () => import('./drop/drop1').then(m => m.Drop01) 
  },
  { 
    path: 'drop2', 
    loadComponent: () => import('./drop/drop2').then(m => m.Drop02) 
  },
  { 
    path: 'product/:id', 
    loadComponent: () => import('./item/productoDetalle').then(m => m.ProductoDetalle) 
  },
  { path: '**', redirectTo: '' }
];