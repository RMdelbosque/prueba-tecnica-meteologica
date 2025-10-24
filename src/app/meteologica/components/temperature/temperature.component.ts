import { Component, inject } from '@angular/core';
import { TemperatureService } from '../../services/weather/temperature.service';

@Component({
  selector: 'temperature',
  imports: [],
  templateUrl: './temperature.component.html',
})
export class TemperatureComponent {
  temperature = inject(TemperatureService);
}
