import { Component, inject } from '@angular/core';
import { TemperatureService } from '../../services/weather/temperature.service';
import { LineChartComponent } from "../line-chart/line-chart.component";

@Component({
  selector: 'temperature',
  imports: [LineChartComponent],
  templateUrl: './temperature.component.html',
})
export class TemperatureComponent {
  temperature = inject(TemperatureService);
}
