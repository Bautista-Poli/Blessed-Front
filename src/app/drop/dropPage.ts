// src/app/drop/drop-page.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Drop }                      from './drop';
import { DropComingSoonComponent }   from './dropComingSoon';
import { CatalogHeader }             from '../catalog-header/catalog-header';
import { ProductService }            from '../services/product.service';
import { FilterService }             from '../services/filter.service';
import { DropConfig }      from '../interfaces/drop';
import { CatalogProduct }  from '../interfaces/product';

@Component({
  selector: 'app-drop-page',
  standalone: true,
  imports: [CommonModule, Drop, DropComingSoonComponent, CatalogHeader],
  template: `
    @if (loading()) {
      <div class="drop-loading">Cargando...</div>
    } @else if (error()) {
      <div class="drop-error">Drop no encontrado.</div>
    } @else {
      <catalog-header
        [title]="config()?.label || ''"
        [filters]="fs.filters()"
        [activeFilter]="fs.activeFilter()"
        [sortOptions]="fs.sortOptions"
        [sortOpen]="fs.sortOpen()"
        [gridView]="fs.gridView()"
        (filterChanged)="fs.setFilter($event)"
        (sortChanged)="fs.setSort($event)"
        (toggleSort)="fs.toggleSort()"
        (viewChanged)="fs.setGridView($event)"
      ></catalog-header>

      @if (isComingSoon()) {
        <app-drop-coming-soon [config]="config()!"></app-drop-coming-soon>
      } @else {
        <app-drop-landing
          [config]="config()!"
          [products]="products()"
          [gridView]="fs.gridView()">
        </app-drop-landing>
      }
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
  readonly fs            = inject(FilterService);

  config   = signal<DropConfig | null>(null);
  products = signal<CatalogProduct[]>([]);
  loading  = signal(true);
  error    = signal(false);

  isComingSoon = computed(() => {
    const cfg = this.config();
    if (!cfg) return false;
    const release = new Date(cfg.release_date).getTime();
    return !isNaN(release) && release > Date.now();
  });

  ngOnInit(): void {
    this.fs.loadDrops();

    this.route.paramMap.subscribe(params => {
      const dropId = params.get('id') ?? '';
      this.fs.activeFilter.set(dropId);
      this.loadDropData(dropId);
    });
  }

  private loadDropData(dropId: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.products.set([]);

    this.productService.getDrop(dropId).subscribe({
      next: (config) => {
        this.config.set(config);
        if (this.isComingSoon()) {
          this.loading.set(false);
          return;
        }
        this.productService.getProducts({ drop: dropId }).subscribe({
          next:  products => { this.products.set(products); this.loading.set(false); },
          error: ()       => this.loading.set(false),
        });
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
