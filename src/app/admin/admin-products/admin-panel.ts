// src/app/admin/products/admin-products.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService }              from '../auth.service';
import { ProductService }           from '../../services/product.service';
import { DropService }              from '../../services/drop.service';
import { AdminProductCardComponent } from './admin-products-card/admin-products-card';
import { AdminDropsComponent }      from './admin-drop/admin-drop';
import { AdminProductFormComponent } from './admin-products-card/admin-product-form/admin-product-form';

type AdminTab = 'productos' | 'drops';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    AdminProductCardComponent,
    AdminProductFormComponent,
    AdminDropsComponent,
  ],
  templateUrl: './admin-panel.html',
  styleUrl:    './admin-panel.css',
})
export class AdminPanel implements OnInit {
  private auth           = inject(AuthService);
  private router         = inject(Router);
  private productService = inject(ProductService);
  private dropService    = inject(DropService);

  activeTab = signal<AdminTab>('productos');

  products    = toSignal(this.productService.products$, { initialValue: [] });
  deleting    = signal<string | null>(null);
  successMsg  = signal<string | null>(null);
  errorMsg    = signal<string | null>(null);
  showForm    = signal(false);
  searchQuery = signal('');

  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.products().filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
    );
  });

  drops            = toSignal(this.dropService.drops$, { initialValue: [] });
  activeDropsCount = computed(() => this.drops().filter(d => d.active).length);

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
    }
    this.productService.getProducts().subscribe();
    this.dropService.getDrops().subscribe();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }

  toggleForm(): void { this.showForm.update(v => !v); }

  onProductSaved(name: string): void {
    this.showForm.set(false);
    this.successMsg.set(`"${name}" agregado correctamente.`);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  async deleteProduct(id: string, name: string): Promise<void> {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    this.deleting.set(id);
    try {
      await this.productService.deleteProduct(id);
      this.successMsg.set(`"${name}" eliminado.`);
      setTimeout(() => this.successMsg.set(null), 3000);
    } catch {
      this.errorMsg.set('Error al eliminar el producto.');
    } finally {
      this.deleting.set(null);
    }
  }
}