export interface MenuOption {
  label: string;
  route: string;
}

export const MENU_OPTIONS: MenuOption[] = [
  { label: 'Inicio', route: 'home' },
  { label: 'Temperatura', route: 'temperature' },
  { label: 'Energía', route: 'power' }
];
