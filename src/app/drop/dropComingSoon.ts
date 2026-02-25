// src/app/drop/drop-coming-soon.ts
import {
  Component, Input, OnInit, OnDestroy,
  ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropConfig } from '../interfaces/drop';
import { CatalogHeader } from '../catalog-header/catalog-header';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-drop-coming-soon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dropComingSoon.html',
  styleUrl: 'dropComingSoon.css',
})
export class DropComingSoonComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config!: DropConfig;

  private cdr = inject(ChangeDetectorRef);
  private interval?: ReturnType<typeof setInterval>;

  timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  get formattedDate(): string {
    // Intenta parsear la fecha, si falla muestra tal cual
    const d = new Date(this.config.release_date);
    if (isNaN(d.getTime())) return this.config.release_date;
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  ngOnInit(): void {
    this.tick();
    this.interval = setInterval(() => {
      this.tick();
      this.cdr.markForCheck();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  private tick(): void {
    const release = new Date(this.config.release_date).getTime();
    const now     = Date.now();
    const diff    = Math.max(0, release - now);

    this.timeLeft = {
      days:    Math.floor(diff / 86_400_000),
      hours:   Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000)  / 60_000),
      seconds: Math.floor((diff % 60_000)      / 1_000),
    };
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}