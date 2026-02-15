import { CommonModule } from "@angular/common";
import { Drop, DropConfig } from "./drop";
import { Component } from "@angular/core";
import { CatalogProduct } from "../catalog/catalog";


@Component({
  selector: 'app-drop02',
  standalone: true,
  imports: [CommonModule, Drop],
  template: `
    <app-drop-landing
      [config]="config"
      [products]="products">
    </app-drop-landing>
  `,
})
export class Drop02 {

  config: DropConfig = {
    id:          'drop02',
    number:      '02',
    label:       'DROP 02 — 2025',
    tagline:     'Más pesado. Más oscuro. El segundo capítulo de BLESSED.',
    description: 'Drop 02 lleva la identidad de la marca a su máxima expresión. Construidos en 380gsm french terry y algodón premium, estos son los básicos que no son básicos.',
    heroImage:   'assets/IndexSlide-2.webp',
    heroImage2:  'assets/IndexSlide-1.webp',
    accentColor: '#c8a96e',
    releaseDate: '2025',
    totalPieces: 6,
  };

  products: CatalogProduct[] = [
    {
      id: 'p01', drop: 'drop02', cat: 'hoodies', isNew: true, isSale: true,
      name: '"SQ" HOODIE', price: 51000, originalPrice: 85000,
      image:      'assets/Products/Product 2/product2-3.webp',
      imageHover: 'assets/Products/Product 2/product2.webp',
    },
    {
      id: 'p02', drop: 'drop02', cat: 'tshirts', isNew: true, isSale: true,
      name: '"BLES SED" TEE', price: 29900, originalPrice: 46000,
      image:      'assets/Products/Product 1/product1-4.webp',
      imageHover: 'assets/Products/Product 1/product1-5.webp',
    },
    {
      id: 'p03', drop: 'drop02', cat: 'crewnecks', isNew: false, isSale: true,
      name: '"ESSENTIAL" CREWNECK', price: 45000, originalPrice: 75000,
      image:      'assets/Products/Product 3/Producto3-1.webp',
      imageHover: 'assets/Products/Product 3/Producto3-2.webp',
    },
    {
      id: 'p04', drop: 'drop02', cat: 'tshirts', isNew: false, isSale: true,
      name: '"SQ WHITE" TEE', price: 29900, originalPrice: 46000,
      image:      'assets/Products/Producto 4/Producto4-1.webp',
      imageHover: 'assets/Products/Producto 4/Producto4-2.webp',
    },
    {
      id: 'p05', drop: 'drop02', cat: 'tshirts', isNew: true, isSale: true,
      name: '"GRAFFI-TEE"', price: 27600, originalPrice: 46000,
      image:      'assets/Products/Producto 5/Producto5-1.webp',
      imageHover: 'assets/Products/Producto 5/Producto5-2.webp',
    },
    {
      id: 'p06', drop: 'drop02', cat: 'crewnecks', isNew: false, isSale: true,
      name: '"BB" CREWNECK', price: 45000, originalPrice: 75000,
      image:      'assets/Products/Producto 6/Producto6-1.webp',
      imageHover: 'assets/Products/Producto 6/Producto6-2.webp',
    },
  ];
}