import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import ('./meteologica/pages/home-page/home-page.component')
  },
  {
    path: 'temperature',
    loadComponent: () => import ('./meteologica/pages/temperature-page/temperature-page.component')
  },
  {
    path: 'power',
    loadComponent: () => import ('./meteologica/pages/power-page/power-page.component')
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
