// src/app/admin/components/admin-product-card/admin-product-card.ts

import { CommonModule } from '@angular/common';
import { CatalogProduct } from '../../../../product.service';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

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
  
  get allImages(): string[] {
    const images = [this.product.images[0]];
    if (this.product.images[1]) images.push(this.product.images[1]);
    if (this.product.images) images.push(...this.product.images);
    return images;
  }

  scroll(direction: number) {
    const el = this.slider.nativeElement;
    const scrollAmount = el.offsetWidth; // Desplazamos exactamente el ancho de una foto
    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      minimumFractionDigits: 0 
    }).format(n);
  }

  get discount(): number {
    const p = this.product;
    if (!p.isSale || p.originalPrice === p.price) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }
}
