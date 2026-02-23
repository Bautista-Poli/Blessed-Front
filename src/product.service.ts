// src/app/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DropConfig } from './app/drop/drop';

export interface ProductColor {
  name: string;
  hex:  string;
}

export interface ProductStock {
  size:  string;
  color: string | null;
  stock: number;
}

export interface CatalogProduct {
  id:            string;
  cat:           string;
  drop:          'drop01' | 'drop02' | 'all';
  name:          string;
  price:         number;
  originalPrice: number;
  isNew:         boolean;
  isSale:        boolean;
  image:         string;
  imageHover?:   string;
  description?:  string;
  colors:        ProductColor[];
  stock:         ProductStock[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private readonly API = 'https://blessed-back-production.up.railway.app/api';

  getProducts(filters?: { drop?: string; cat?: string }): Observable<CatalogProduct[]> {
    let params = new HttpParams();
    if (filters?.drop && filters.drop !== 'all') params = params.set('drop', filters.drop);
    if (filters?.cat  && filters.cat  !== 'all') params = params.set('cat',  filters.cat);
    return this.http.get<CatalogProduct[]>(`${this.API}/products`, { params });
  }

  getProduct(id: string): Observable<CatalogProduct> {
    return this.http.get<CatalogProduct>(`${this.API}/products/${id}`);
  }
  getDrops(): Observable<DropConfig[]> {
    return this.http.get<DropConfig[]>(`${this.API}/drops`);
    }

    getDrop(id: string): Observable<DropConfig> {
    return this.http.get<DropConfig>(`${this.API}/drops/${id}`);
    }
}