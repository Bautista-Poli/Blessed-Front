import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { DropConfig } from '../../interfaces/drop';

// Definimos una interfaz local para el tipado de la UI
interface PanelDrop {
  eyebrow: string;
  title: string;
  italicTitle: string;
  link: string;
  imageUrl: string;
}

@Component({
  selector: 'panelInicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-inicio.html',
  styleUrls: ['./panel-inicio.css']
})
export class PanelInicioComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  
  // Tipamos el array correctamente
  drops: PanelDrop[] = []; 
  activePanel: 'left' | 'right' | null = null;

  ngOnInit(): void {
    this.loadLatestDrops();
  }

  loadLatestDrops() {
    this.productService.getDrops().pipe(
      map((allDrops: DropConfig[]) => {
        // Filtramos por activos y tomamos los últimos 2 de la lista
        return allDrops
          .filter(d => d.active) 
          .slice(-2);
      })
    ).subscribe({
      next: (latestDrops) => {
        // Mapeamos a la estructura de la interfaz PanelDrop
        this.drops = latestDrops.map(d => ({
          eyebrow: d.description,
          title: d.label,
          italicTitle: d.tagline,
          link: `/drops/${d.number}`,
          imageUrl: d.hero_image 
        }));

        // Forzamos la detección de cambios para que las imágenes aparezcan 
        // apenas se descarguen, sin esperar a un evento externo.
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando drops del backend', err)
    });
  }

  onHeroPanelEnter(panel: 'left' | 'right') {
    this.activePanel = panel;
  }

  onHeroPanelLeave() {
    this.activePanel = null;
  }

  getHeroPanelFlex(panel: 'left' | 'right'): string {
    if (!this.activePanel) return '1';
    return this.activePanel === panel ? '1.5' : '0.5';
  }
}
