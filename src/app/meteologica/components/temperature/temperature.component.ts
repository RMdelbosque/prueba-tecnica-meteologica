import { Component, inject } from '@angular/core';
import { TemperatureService } from '../../services/weather/temperature.service';
import { TemperatureChartComponent } from "./temperature-chart/temperature-chart.component";

@Component({
  selector: 'temperature',
  imports: [TemperatureChartComponent],
  templateUrl: './temperature.component.html',
})
export class TemperatureComponent {
  temperature = inject(TemperatureService);
}
