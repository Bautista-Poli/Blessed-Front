// src/app/drop/drop-page.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Drop } from './drop';
import { ProductService } from '../services/product.service';
import { DropConfig } from '../interfaces/drop';
import { CatalogProduct } from '../interfaces/product';

@Component({
  selector: 'app-drop-page',
  standalone: true,
  imports: [CommonModule, Drop],
  template: `
    @if (loading()) {
      <div class="drop-loading">Cargando...</div>
    } @else if (error()) {
      <div class="drop-error">Drop no encontrado.</div>
    } @else {
      <app-drop-landing [config]="config()!" [products]="products()">
      </app-drop-landing>
    }
  `,
  styles: [`
    .drop-loading, .drop-error {
      display: flex; align-items: center; justify-content: center;
      height: 100vh; font-family: 'Tenor Sans', sans-serif;
      font-size: 11px; letter-spacing: .2em; text-transform: uppercase; opacity: .4;
    }
  `]
})
export class DropPage implements OnInit {
  private route          = inject(ActivatedRoute);
  private productService = inject(ProductService);

  config   = signal<DropConfig | null>(null);
  products = signal<CatalogProduct[]>([]);
  loading  = signal(true);
  error    = signal(false);

  // drop-page.ts — reemplazá ngOnInit completo

  ngOnInit(): void {
  // paramMap es un Observable que emite cada vez que cambia el :id
    this.route.paramMap.subscribe(params => {
      const dropId = params.get('id') ?? '';

      this.loading.set(true);
      this.error.set(false);
      this.products.set([]);

      this.productService.getDrop(dropId).subscribe({
        next: (config) => {
          this.config.set(config);
          this.productService.getProducts({ drop: dropId }).subscribe({
            next: (products) => {
              this.products.set(products);
              this.loading.set(false);
            }
          });
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });
    });
  }
}
