import { Component } from '@angular/core';
import { TemperatureComponent } from "../../components/temperature/temperature.component";
import { PowerComponent } from "../../components/power/power.component";

@Component({
  selector: 'app-home-page.component',
  imports: [TemperatureComponent, PowerComponent],
  templateUrl: './home-page.component.html',
})
export default class HomePageComponent { }
