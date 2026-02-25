// src/app/drop.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DropConfig, CreateDropPayload } from '../interfaces/drop';

@Injectable({ providedIn: 'root' })
export class DropService {
  private http = inject(HttpClient);
  private readonly API = 'https://blessed-back-production.up.railway.app/api';

  private _drops$ = new BehaviorSubject<DropConfig[]>([]);
  readonly drops$ = this._drops$.asObservable();

  getDrops(): Observable<DropConfig[]> {
    return this.http.get<DropConfig[]>(`${this.API}/drops`).pipe(
      tap(drops => this._drops$.next(drops))
    );
  }

  getDrop(id: string): Observable<DropConfig> {
    return this.http.get<DropConfig>(`${this.API}/drops/${id}`);
  }

  createDrop(payload: CreateDropPayload): Promise<DropConfig> {
    return this.http.post<DropConfig>(`${this.API}/drops`, payload).pipe(
      tap(d => this._drops$.next([d, ...this._drops$.getValue()]))
    ).toPromise() as Promise<DropConfig>;
  }

  updateDrop(id: string, payload: Partial<DropConfig>): Promise<DropConfig> {
    return this.http.put<DropConfig>(`${this.API}/drops/${id}`, payload).pipe(
      tap(updated => this._drops$.next(
        this._drops$.getValue().map(d => d.id === id ? updated : d)
      ))
    ).toPromise() as Promise<DropConfig>;
  }

  deleteDrop(id: string): Promise<void> {
    return this.http.delete<void>(`${this.API}/drops/${id}`).pipe(
      tap(() => this._drops$.next(
        this._drops$.getValue().filter(d => d.id !== id)
      ))
    ).toPromise() as Promise<void>;
  }

  toggleActive(id: string, active: boolean): Promise<DropConfig> {
    return this.updateDrop(id, { active });
  }
}