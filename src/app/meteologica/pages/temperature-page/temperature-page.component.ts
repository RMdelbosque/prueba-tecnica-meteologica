import { Component } from '@angular/core';
import { TemperatureComponent } from "../../components/temperature/temperature.component";

@Component({
  selector: 'app-temperature-page.component',
  imports: [TemperatureComponent],
  templateUrl: './temperature-page.component.html',
})
export default class TemperaturePageComponent { }
