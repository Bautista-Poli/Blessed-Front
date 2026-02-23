import { Component, OnInit, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../cart.service';
import { ProductService, CatalogProduct } from '../../product.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './productoDetalle.html',
  styleUrl: './productoDetalle.css',
})
export class ProductoDetalle implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private productService = inject(ProductService);
  private cart           = inject(CartService);

  product: CatalogProduct | null = null;
  loading     = true;
  notFound    = false;

  selectedColorIdx = 0;
  selectedSize     = '';
  activeImgIdx     = 0;
  detailsOpen      = false;
  addedToBag       = false;
  get availableSizes(): string[] {
  const order = ['XS', 'S', 'M', 'L', 'XL'];
    const sizes = [...new Set(
      (this.product?.stock ?? [])
        .filter(s => s.stock > 0)
        .map(s => s.size)
    )];
    return order.filter(s => sizes.includes(s));
  }

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    
    this.productService.getProduct(id).subscribe({
      next: (p) => { 
        console.log('Producto recibido:', p);
        this.product = p; 
        this.loading = false; 
        this.cdr.detectChanges(); // <--- ESTO fuerzo la actualización de la UI
      },
      error: (err) => { 
        this.notFound = true; 
        this.loading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  // ── Imágenes: usa images[] del producto ───────────────────
  get images(): string[] {
    return this.product?.images ?? [];
  }

  get activeImage(): string {
    return this.images[this.activeImgIdx] ?? '';
  }

  get selectedColor() {
    return this.product?.colors?.[this.selectedColorIdx] ?? { name: '', hex: '#000' };
  }

  get discount(): number {
    if (!this.product) return 0;
    const { price, originalPrice } = this.product;
    if (!originalPrice || originalPrice === price) return 0;
    return Math.round((1 - price / originalPrice) * 100);
  }

  get installmentPrice(): string {
    return this.formatPrice(Math.floor((this.product?.price ?? 0) / 3));
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0
    }).format(n);
  }

  setImage(idx: number): void    { this.activeImgIdx = idx; }
  nextImage(): void              { this.activeImgIdx = (this.activeImgIdx + 1) % this.images.length; }
  prevImage(): void              { this.activeImgIdx = (this.activeImgIdx - 1 + this.images.length) % this.images.length; }
  selectColor(idx: number): void { this.selectedColorIdx = idx; this.activeImgIdx = 0; }
  selectSize(s: string): void    { this.selectedSize = s; }
  toggleDetails(): void          { this.detailsOpen = !this.detailsOpen; }

  onAddToCart(): void {
    if (!this.selectedSize || !this.product) return;
    this.cart.add({
      product: this.product.name,
      price:   this.product.price,
      size:    this.selectedSize,
      color:   this.selectedColor?.name ?? '',
      image:   this.images[0],
    });
    this.addedToBag = true;
    setTimeout(() => { this.addedToBag = false; }, 2200);
  }

  

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.nextImage();
    if (e.key === 'ArrowLeft')  this.prevImage();
  }
}
