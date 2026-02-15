// src/app/components/cart-drawer/cart-drawer.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { RouterModule }                 from '@angular/router';
import { Subscription }                 from 'rxjs';
import { CartItem, CartService } from '../../cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-drawer.html',
  styleUrl:    './cart-drawer.css',
})
export class CartDrawer implements OnInit, OnDestroy {

  // El componente expone los datos del servicio directamente
  // No necesita @Input() de ningún padre
  items:  CartItem[] = [];
  isOpen  = false;

  private subs = new Subscription();

  constructor(public cart: CartService) {}

  ngOnInit(): void {
    // Se suscribe al estado global — se actualiza en cualquier pantalla
    this.subs.add(
      this.cart.items$.subscribe(items => this.items = items)
    );
    this.subs.add(
      this.cart.open$.subscribe(open => this.isOpen = open)
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Acciones delegadas al servicio ────────────────────────
  close():           void { this.cart.close(); }
  remove(id: string):void { this.cart.remove(id); }

  updateQty(id: string, delta: number): void {
    const item = this.items.find(i => i.id === id);
    if (item) this.cart.updateQuantity(id, item.quantity + delta);
  }

  onOverlayClick(): void { this.cart.close(); }

  // ── Helpers de vista ──────────────────────────────────────
  get count():        number { return this.cart.count; }
  get total():        number { return this.cart.total; }
  get installments(): string { return this.cart.installments; }

  formatPrice(n: number): string {
    return this.cart.formatPrice(n);
  }
}
