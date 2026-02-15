import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ── Tipos ──────────────────────────────────────────────────
export interface ProductColor {
  name: string;
  hex: string;
  images: string[];   // galería de fotos para este color
}

export interface ProductDetail {
  id: string;
  cat: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  details: string[];  // lista de características
  colors: ProductColor[];
  sizes: string[];
  badge?: string;
}

export interface AddToCartEvent {
  product: string;
  price: number;
  color: string;
  size: string;
}

// ── Componente ─────────────────────────────────────────────
@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productoDetalle.html',
  styleUrl: './productoDetalle.css',
})
export class ProductoDetalle implements OnInit {

  // Recibe el producto desde el padre / router
  // En producción vendría via ActivatedRoute + service
  @Input() product: ProductDetail = {
    id: 'p01',
    cat: 'Hoodies',
    name: '"SQ" HOODIE',
    price: 51000,
    originalPrice: 85000,
    description:
      'Construida para durar. Diseñada para destacar. La pieza central del segundo drop de BLESSED llega en un peso premium de 380gsm french terry con un fit oversize que habla por sí solo.',
    details: [
      '380gsm french terry',
      'Fit oversize',
      'Bordado en pecho',
      'Canguro interior con zipper',
      '100% algodón ring-spun',
      'Lavable a máquina',
    ],
    colors: [
      {
        name: 'Negro',
        hex: '#1a1a18',
        images: [
          'assets/Products/Product 2/product2.webp',
          'assets/Products/Product 2/product2-2.webp',
          'assets/Products/Product 2/product2-3.webp',
          'assets/Products/Product 2/product2-4.webp',
        ],
      },
      {
        name: 'Blanco',
        hex: '#f0ece4',
        images: [
          'assets/Products/Product 2/product2.webp',
          'assets/Products/Product 2/product2.webp',
          'assets/Products/Product 2/product2.webp',
        ],
      },
      {
        name: 'Gris',
        hex: '#8a8a88',
        images: [
          'assets/Products/Product 2/product2.webp',
          'assets/Products/Product 2/product2.webp',
        ],
      },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    badge: '−40%',
  };

  @Output() addToCart = new EventEmitter<AddToCartEvent>();

  // ── Estado ─────────────────────────────────────────────
  selectedColorIdx  = 0;
  selectedSize      = '';
  activeImgIdx      = 0;
  detailsOpen       = false;
  addedToBag        = false;
  zoomActive        = false;
  zoomX             = 0;
  zoomY             = 0;

  // ── Getters ────────────────────────────────────────────
  get selectedColor(): ProductColor {
    return this.product.colors[this.selectedColorIdx];
  }

  get images(): string[] {
    return this.selectedColor.images;
  }

  get activeImage(): string {
    return this.images[this.activeImgIdx] ?? this.images[0];
  }

  get discount(): number {
    const { price, originalPrice } = this.product;
    if (!originalPrice || originalPrice === price) return 0;
    return Math.round((1 - price / originalPrice) * 100);
  }

  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-AR')}`;
  }

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {}

  // ── Galería ────────────────────────────────────────────
  setImage(idx: number): void {
    this.activeImgIdx = idx;
  }

  nextImage(): void {
    this.activeImgIdx = (this.activeImgIdx + 1) % this.images.length;
  }

  prevImage(): void {
    this.activeImgIdx =
      (this.activeImgIdx - 1 + this.images.length) % this.images.length;
  }

  // ── Color ──────────────────────────────────────────────
  selectColor(idx: number): void {
    this.selectedColorIdx = idx;
    this.activeImgIdx     = 0;   // reset galería al cambiar color
  }

  // ── Talle ──────────────────────────────────────────────
  selectSize(size: string): void {
    this.selectedSize = size;
  }

  // ── Carrito ────────────────────────────────────────────
  onAddToCart(): void {
    if (!this.selectedSize) return;

    this.addToCart.emit({
      product: this.product.name,
      price:   this.product.price,
      color:   this.selectedColor.name,
      size:    this.selectedSize,
    });

    this.addedToBag = true;
    setTimeout(() => { this.addedToBag = false; }, 2200);
  }
    // Reemplazá el getter existente o agregá este
  get installmentPrice(): string {
    return this.formatPrice(Math.floor(this.product.price / 3));
  }

  toggleZoom(e: MouseEvent): void {
    this.zoomActive = !this.zoomActive;

    // Si lo estamos activando, calculamos la posición inicial inmediatamente
    if (this.zoomActive) {
      this.onImageMouseMove(e);
    }
  }

  // Modificamos ligeramente esta para que solo calcule si está activo
  onImageMouseMove(e: MouseEvent): void {
    if (!this.zoomActive) return; // Solo calcular si el usuario hizo click

    const el   = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.zoomX = ((e.clientX - rect.left) / rect.width)  * 100;
    this.zoomY = ((e.clientY - rect.top)  / rect.height) * 100;
  }

  onImageEnter(): void { this.zoomActive = true;  }
  onImageLeave(): void { this.zoomActive = false; }

  // ── Keyboard nav ──────────────────────────────────────
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.nextImage();
    if (e.key === 'ArrowLeft')  this.prevImage();
  }

  // ── Toggle detalles ────────────────────────────────────
  toggleDetails(): void { this.detailsOpen = !this.detailsOpen; }
}
