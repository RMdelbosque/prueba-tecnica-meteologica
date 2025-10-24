import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuOptions {
  label: string;
  route: string;
}

@Component({
  selector: 'navbar-mobile-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-mobile-menu.component.html',
})
export class NavbarMobileMenuComponent {
  @Output() closeMenu = new EventEmitter<void>();

  menuOptions: MenuOptions[] = [
    {
      label: 'Inicio',
      route: 'home'
    },
    {
      label: 'Temperatura',
      route: 'temperature'
    },
    {
      label: 'Energía',
      route: 'power'
    }
  ]
 }
