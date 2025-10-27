import { Component } from '@angular/core';
import { TemperatureComponent } from "../temperature/temperature.component";
import { PowerComponent } from "../power/power.component";

@Component({
  selector: 'home',
  imports: [TemperatureComponent, PowerComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent { }
