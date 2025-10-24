import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU_OPTIONS, MenuOption } from '../../../interfaces/menu-options.interface';

@Component({
  selector: 'navbar-mobile-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-mobile-menu.component.html',
})
export class NavbarMobileMenuComponent {
  @Output() closeMenu = new EventEmitter<void>();

  menuOptions: MenuOption[] = MENU_OPTIONS;
 }
