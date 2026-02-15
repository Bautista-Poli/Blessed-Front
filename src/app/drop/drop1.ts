import { Component }        from '@angular/core';
import { CommonModule }     from '@angular/common';
import { CatalogProduct }   from '../catalog/catalog';
import { Drop, DropConfig } from './drop';

@Component({
  selector: 'app-drop01',
  standalone: true,
  imports: [CommonModule, Drop],
  template: `
    <app-drop-landing
      [config]="config"
      [products]="products">
    </app-drop-landing>
  `,
})
export class Drop01 {

  config: DropConfig = {
    id:          'drop01',
    number:      '01',
    label:       'DROP 01 — 2024',
    tagline:     'Los orígenes. La primera vez que BLESSED tomó forma.',
    description: 'El primer drop establece el lenguaje visual de la marca. Piezas construidas con intención, sin excesos. Cada detalle cuenta una historia que recién empieza.',
    heroImage:   'assets/IndexSlide-3.webp',
    heroImage2:  'assets/IndexSlide-4.webp',
    accentColor: '#e8e4dc',
    releaseDate: '2024',
    totalPieces: 2,
  };

  // Solo productos del drop01
  products: CatalogProduct[] = [
    {
      id: 'p07', drop: 'drop01', cat: 'hoodies', isNew: false, isSale: false,
      name: '"BASIC 01" HOODIE', price: 65000, originalPrice: 65000,
      image:      'assets/Products/Producto 7/Producto7-1.webp',
      imageHover: 'assets/Products/Producto 7/Producto7-2.webp',
    },
    {
      id: 'p08', drop: 'drop01', cat: 'tshirts', isNew: false, isSale: false,
      name: '"QUOTATION" TEE', price: 29900, originalPrice: 29900,
      image:      'assets/Products/Product 2/product2.webp',
      imageHover: 'assets/Products/Product 2/product2.webp',
    },
  ];
}
