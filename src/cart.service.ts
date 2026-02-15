// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: string;
  product: string;
  price: number;
  size: string;
  color?: string;
  quantity: number;
  image?: string;
}

@Injectable({
  // providedIn: 'root' → UNA sola instancia para toda la app
  // Todos los componentes comparten el mismo estado automáticamente
  providedIn: 'root',
})
export class CartService {

  // ── Estado privado ─────────────────────────────────────────
  // BehaviorSubject: guarda el valor actual y lo emite a
  // cualquier componente que se suscriba, incluso en otras rutas
  private _items$ = new BehaviorSubject<CartItem[]>([]);
  private _open$  = new BehaviorSubject<boolean>(false);

  // ── Observables públicos (solo lectura) ────────────────────
  readonly items$: Observable<CartItem[]> = this._items$.asObservable();
  readonly open$:  Observable<boolean>    = this._open$.asObservable();

  // ── Getters derivados ──────────────────────────────────────
  get items(): CartItem[] {
    return this._items$.getValue();
  }

  get count(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get installments(): string {
    if (this.items.length === 0) return '';
    return `3 cuotas sin interés de ${this.formatPrice(Math.floor(this.total / 3))}`;
  }

  get isOpen(): boolean {
    return this._open$.getValue();
  }

  // ── Acciones ───────────────────────────────────────────────

  add(item: Omit<CartItem, 'id' | 'quantity'>): void {
    const current = this.items;
    const key     = `${item.product}__${item.size}__${item.color ?? ''}`;
    const exists  = current.find(
      i => `${i.product}__${i.size}__${i.color ?? ''}` === key
    );

    if (exists) {
      this._items$.next(
        current.map(i => i === exists ? { ...i, quantity: i.quantity + 1 } : i)
      );
    } else {
      this._items$.next([
        ...current,
        { ...item, id: this.uid(), quantity: 1 },
      ]);
    }

    this.open();
  }

  remove(id: string): void {
    this._items$.next(this.items.filter(i => i.id !== id));
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) { this.remove(id); return; }
    this._items$.next(
      this.items.map(i => i.id === id ? { ...i, quantity } : i)
    );
  }

  clear(): void {
    this._items$.next([]);
  }

  open():  void { this._open$.next(true);  document.body.style.overflow = 'hidden'; }
  close(): void { this._open$.next(false); document.body.style.overflow = '';       }
  toggle(): void { this.isOpen ? this.close() : this.open(); }

  // ── Utils ──────────────────────────────────────────────────
  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-AR')}`;
  }

  private uid(): string {
    return Math.random().toString(36).slice(2, 9);
  }
}