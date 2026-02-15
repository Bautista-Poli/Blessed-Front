import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartDrawer } from './cart-drawer/cart-drawer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CartDrawer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('blessed');
}
