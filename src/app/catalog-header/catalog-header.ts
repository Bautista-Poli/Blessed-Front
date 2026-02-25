import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Subscription, map } from 'rxjs'; // ◄ Asegúrate de importar map
import { RouterModule } from '@angular/router';

@Component({
  selector: 'catalog-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalog-header.html',
  styleUrl: './catalog-header.css'
})
export class CatalogHeader implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() activeFilter: string = 'all';
  @Input() activeSort: string = 'new';
  @Input() sortOpen: boolean = false;
  @Input() gridView: '2col' | '4col' = '4col';
  @Input() visibleCount: number = 0;
  @Input() filters: any[] = [];
  @Input() sortOptions: any[] = [];

  @Output() filterChanged = new EventEmitter<string>();
  @Output() sortChanged = new EventEmitter<string>();
  @Output() toggleSort = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'2col' | '4col'>();

  cartCount = 0;
  private subs = new Subscription();

  constructor(private cart: CartService) {}

  ngOnInit(): void {
    // Escuchar cambios en el carrito para actualizar el contador
    this.subs.add(
      this.cart.items$
        .pipe(map(items => items.reduce((sum, i) => sum + i.quantity, 0)))
        .subscribe(count => {
          this.cartCount = count;
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleCart(): void {
    this.cart.toggle();
  }

  // Métodos puente
  onSetFilter(val: string) { this.filterChanged.emit(val); }
  onSetSort(val: string) { this.sortChanged.emit(val); }
  onToggleSort() { this.toggleSort.emit(); }
  onSetView(val: '2col' | '4col') { this.viewChanged.emit(val); }
}
