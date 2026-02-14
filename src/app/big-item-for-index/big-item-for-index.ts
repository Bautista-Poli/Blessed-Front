import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AddToCartEvent {    // ← export
  product: string;
  price: number;
  size: string;
}

@Component({
  selector: 'app-big-item-for-index',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './big-item-for-index.html',
  styleUrl: './big-item-for-index.css',
})
export class BigItemForIndex {
  @Output() onAddToCart = new EventEmitter<AddToCartEvent>();

  selectedSize = '';

  selectSize(groupKey: string, size: string): void {
    this.selectedSize = size;
  }

  isSizeSelected(groupKey: string, size: string): boolean {
    return this.selectedSize == size;
  }

  // 3. Cuando se hace clic, mandamos los datos al padre
  onAddClick(): void {
    this.onAddToCart.emit({
      product: 'SQ Hoodie',
      price: 51000,
      size: this.selectedSize
    });
  }
}
