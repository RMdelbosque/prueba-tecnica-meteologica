import { Component, inject } from '@angular/core';
import { PowerService } from '../../services/weather/power.service';
import { LineChartComponent } from "../line-chart/line-chart.component";

@Component({
  selector: 'power',
  imports: [LineChartComponent],
  templateUrl: './power.component.html',
})
export class PowerComponent {
  power = inject(PowerService);
}
