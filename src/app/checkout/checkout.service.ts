// checkout.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  id: string;
  product: string;
  price: number;
  quantity: number;
  size: string;
  color?: string;
  image?: string;
}

export interface CheckoutResponse {
  init_point: string;
  sandbox_init_point: string;
  preference_id: string;
}

export interface ShippingAddress {
  nombre:    string;
  apellido:  string;
  calle:     string;
  localidad: string;
  provincia: string;
  cp:        string;
  telefono:  string;
}

export interface CheckoutPayload {
  email: string;
  shipping: {
    cost:    number;
    name:    string;
    address: ShippingAddress;
  };
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http   = inject(HttpClient);
  private apiUrl = 'https://blessed-back-production.up.railway.app/api';

  createPreference(items: CartItem[], payload: CheckoutPayload): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, { items, ...payload });
  }
}