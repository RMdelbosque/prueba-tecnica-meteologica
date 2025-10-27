export interface MenuOption {
  label: string;
  route: string;
}

export const MENU_OPTIONS: MenuOption[] = [
  { label: 'Home', route: 'home' },
  { label: 'Temperature', route: 'temperature' },
  { label: 'Power', route: 'power' }
];
