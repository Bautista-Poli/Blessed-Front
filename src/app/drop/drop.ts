import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropConfig } from '../interfaces/drop';
import { CatalogProduct } from '../interfaces/product';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-drop-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './drop.html',
  styleUrl: './drop.css',
})
export class Drop implements OnInit, AfterViewInit, OnDestroy {
  @Input() config!: DropConfig;
  @Input() products: CatalogProduct[] = [];
  @Input() activeSort: string = 'new';
  
  @Input() gridView: '2col' | '4col' = '4col';
  
  heroVisible = false;
  private revealObserver?: IntersectionObserver;

  // ── Lógica de Talles y Carrito (Reintegrada para el HTML) ────
  readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];
  private selectedSizes = new Map<string, string>();

  constructor(
    private cart: CartService,
    private cdr: ChangeDetectorRef,
  ) {}

  // Getter para itemCount que pide el HTML
  get itemCount(): number {
    return this.products.length;
  }

  // Lógica de ordenamiento para la grilla

  ngOnInit(): void {
    if (this.config) {
      document.documentElement.style.setProperty('--drop-accent', this.config.accent_color);
    }
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.heroVisible = true;
      this.cdr.detectChanges();
      this.initScrollReveal();
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    document.documentElement.style.removeProperty('--drop-accent');
  }

  // ── Métodos de interacción con el Producto ──────────────────

  selectSize(pid: string, size: string, e: Event): void {
    e.stopPropagation();
    this.selectedSizes.set(pid, size);
  }

  isSizeSelected(pid: string, size: string): boolean {
    return this.selectedSizes.get(pid) === size;
  }

  discount(p: CatalogProduct): number {
    if (!p.isSale || p.originalPrice === p.price) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }

  onAddClick(p: CatalogProduct, e: Event): void {
    e.stopPropagation();
    const size = this.selectedSizes.get(p.id) || 'M'; // 'M' por defecto si no eligió
    this.cart.add({ 
      product: p.name, 
      price: p.price, 
      size: size, 
      image: p.images[0] 
    });
  }

  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-AR')}`;
  }

  // ── Animaciones ────────────────────────────────────────────
  private initScrollReveal(): void {
    this.revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('visible');
            this.revealObserver?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07 }
    );

    // Esperar un instante a que los productos se rendericen
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.drop-reveal')
        .forEach(el => this.revealObserver!.observe(el));
    }, 100);
  }
}
