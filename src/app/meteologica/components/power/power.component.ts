import { Component, inject } from '@angular/core';
import { PowerService } from '../../services/weather/power.service';

@Component({
  selector: 'power',
  imports: [],
  templateUrl: './power.component.html',
})
export class PowerComponent {
  power = inject(PowerService);
}
