import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuOptions {
  label: string;
  route: string;
}

@Component({
  selector: 'navbar-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-menu.component.html',
})
export class NavbarMenuComponent {

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
