// src/app/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DropConfig } from '../interfaces/drop';
import { CatalogProduct } from '../interfaces/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private readonly API = 'https://blessed-back-production.up.railway.app/api';

  private _products$ = new BehaviorSubject<CatalogProduct[]>([]);
  readonly products$  = this._products$.asObservable();

  getProducts(filters?: { drop?: string; cat?: string }): Observable<CatalogProduct[]> {
    let params = new HttpParams();
    if (filters?.drop && filters.drop !== 'all') params = params.set('drop', filters.drop);
    if (filters?.cat  && filters.cat  !== 'all') params = params.set('cat',  filters.cat);
    return this.http.get<CatalogProduct[]>(`${this.API}/products`, { params }).pipe(
      tap(products => this._products$.next(products))
    );
  }

  getProduct(id: string): Observable<CatalogProduct> {
    return this.http.get<CatalogProduct>(`${this.API}/products/${id}`);
  }

  createProduct(product: CatalogProduct): Promise<CatalogProduct> {
    return this.http.post<CatalogProduct>(`${this.API}/products`, product).pipe(
      tap(p => this._products$.next([p, ...this._products$.getValue()]))
    ).toPromise() as Promise<CatalogProduct>;
  }

  deleteProduct(id: string): Promise<void> {
    return this.http.delete<void>(`${this.API}/products/${id}`).pipe(
      tap(() => this._products$.next(this._products$.getValue().filter(p => p.id !== id)))
    ).toPromise() as Promise<void>;
  }

  getDrops(): Observable<DropConfig[]> {
    return this.http.get<DropConfig[]>(`${this.API}/drops`);
  }

  getDrop(id: string): Observable<DropConfig> {
    return this.http.get<DropConfig>(`${this.API}/drops/${id}`);
  }
}