import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface IgMedia {
  type: 'image' | 'video';
  src: string;
  alt: string;
}

@Component({
  selector: 'igCarousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ig-carousel.html',
  styleUrl: './ig-carousel.css',
})
export class IgCarousel implements OnInit, OnDestroy {

  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;
  @ViewChild('wrapper', { static: true }) wrapRef!: ElementRef<HTMLElement>;

  // ── Media — ajustá los nombres de archivo según lo que tengas ──
  igMedia: IgMedia[] = [
    { type: 'image', src: 'assets/FotosIg/Foto1Ig.webp', alt: 'BLESSED — 1' },
    { type: 'image', src: 'assets/FotosIg/Foto5Ig.webp', alt: 'BLESSED — 2' },
    { type: 'video', src: 'assets/FotosIg/InstragramVideo1.mp4', alt: 'BLESSED — Video' },
    { type: 'image', src: 'assets/FotosIg/Foto4Ig.webp', alt: 'BLESSED — 3' },
    { type: 'image', src: 'assets/FotosIg/Foto6Ig.webp', alt: 'BLESSED — 4' },
    { type: 'video', src: 'assets/FotosIg/InstragramVideo3.mp4', alt: 'BLESSED — 8' },
    { type: 'image', src: 'assets/FotosIg/Foto3Ig.webp', alt: 'BLESSED — 5' },
    { type: 'image', src: 'assets/FotosIg/Foto2Ig.webp', alt: 'BLESSED — 6' },
    { type: 'video', src: 'assets/FotosIg/InstragramVideo2.mp4', alt: 'BLESSED — 7' },
  ];

  // Duplicamos la lista para el loop infinito sin salto
  get mediaLoop(): IgMedia[] {
    return [...this.igMedia, ...this.igMedia];
  }

  // ── Estado interno ─────────────────────────────────────────
  private offset      = 0;       // px desplazados
  private rafId       = 0;       // requestAnimationFrame id
  private speed       = 0.6;     // px por frame (~36px/s a 60fps)
  private singleWidth = 0;       // ancho de una copia del track
  private paused      = false;   // pausa on hover

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    // Esperamos un frame para que el DOM esté pintado
    requestAnimationFrame(() => {
      this.calculateWidth();
      this.startLoop();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  // ── Calcular ancho de una copia ────────────────────────────
  private calculateWidth(): void {
    const track = this.trackRef.nativeElement;
    // La mitad del track (tenemos items duplicados)
    this.singleWidth = track.scrollWidth / 2;
  }

  // ── Loop de animación ──────────────────────────────────────
  private startLoop(): void {
    const animate = () => {
      if (!this.paused) {
        this.offset += this.speed;

        // Cuando llegamos al final de la primera copia, saltamos al inicio
        // sin que se note (seamless loop)
        if (this.offset >= this.singleWidth) {
          this.offset -= this.singleWidth;
        }

        this.trackRef.nativeElement.style.transform =
          `translateX(${-this.offset}px)`;
      }

      this.rafId = requestAnimationFrame(animate);
    };

    this.rafId = requestAnimationFrame(animate);
  }



  // ── Recalcular si cambia el viewport ──────────────────────
  onResize(): void { this.calculateWidth(); }
}
