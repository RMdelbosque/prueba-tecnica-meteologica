import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU_OPTIONS, MenuOption } from '../../../interfaces/menu-options.interface';

@Component({
  selector: 'navbar-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-menu.component.html',
})
export class NavbarMenuComponent {

  menuOptions: MenuOption[] = MENU_OPTIONS;
}
