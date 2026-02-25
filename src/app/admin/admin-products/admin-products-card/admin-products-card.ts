// src/app/admin/products/admin-products-card/admin-products-card.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CatalogProduct } from '../../../interfaces/product';

@Component({
  selector: 'app-admin-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-products-card.html',
  styleUrl: './admin-products-card.css'
})
export class AdminProductCardComponent {
  @Input({ required: true }) product!: CatalogProduct;
  @Input() isDeleting = false;

  @Output() onDelete = new EventEmitter<void>();
  @ViewChild('slider') slider!: ElementRef<HTMLDivElement>;

  // Bug fix: el original duplicaba imágenes (agregaba images[0], images[1] Y luego ...images completo)
  get allImages(): string[] {
    return this.product.images.filter(Boolean);
  }

  scroll(direction: number): void {
    const el = this.slider.nativeElement;
    el.scrollBy({ left: direction * el.offsetWidth, behavior: 'smooth' });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0
    }).format(n);
  }

  get discount(): number {
    const p = this.product;
    if (!p.isSale || p.originalPrice === p.price) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }
}
