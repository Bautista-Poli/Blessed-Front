// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './admin/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./inicio/inicio').then(m => m.Inicio) 
  },
  { 
    path: 'catalog', 
    loadComponent: () => import('./catalog/catalog').then(m => m.Catalogo) 
  },
  
  {
    path: 'drops/:id',
    loadComponent: () => import('./drop/dropPage').then(m => m.DropPage)
  },
  { 
    path: 'product/:id', 
    loadComponent: () => import('./item/productoDetalle').then(m => m.ProductoDetalle) 
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout/checkout').then(m => m.CheckoutComponent)
  },
  {
    path: 'checkout/success',
    loadComponent: () =>
      import('./checkout-result/checkout-result').then(m => m.CheckoutResultComponent)
  },
  {
    path: 'checkout/failure',
    loadComponent: () =>
      import('./checkout-result/checkout-result').then(m => m.CheckoutResultComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/admin-login').then(m => m.AdminLogin)
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./admin/admin-products/admin-products').then(m => m.AdminProductsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-login').then(m => m.AdminLogin)
  },
  //{ path: '**', redirectTo: '' }
];