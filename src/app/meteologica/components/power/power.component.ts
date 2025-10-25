import { Component, inject } from '@angular/core';
import { PowerService } from '../../services/weather/power.service';
import { PowerChartComponent } from "./power-chart/power-chart.component";

@Component({
  selector: 'power',
  imports: [PowerChartComponent],
  templateUrl: './power.component.html',
})
export class PowerComponent {
  power = inject(PowerService);
}
