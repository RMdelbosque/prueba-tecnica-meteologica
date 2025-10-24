import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarMenuComponent } from "./navbar-menu/navbar-menu.component";
import { NavbarMobileMenuComponent } from './navbar-mobile-menu/navbar-mobile-menu.component';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [RouterLink, NavbarMenuComponent, NavbarMobileMenuComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
