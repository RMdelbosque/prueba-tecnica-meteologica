import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  inject,
  effect,
} from '@angular/core';
import * as d3 from 'd3';
import { TemperatureService } from '../../../services/weather/temperature.service';

interface MinuteAverage {
  minute: string;
  value: number;
}

@Component({
  selector: 'temperature-chart',
  imports: [],
  templateUrl: './temperature-chart.component.html',
})
export class TemperatureChartComponent implements OnInit, OnDestroy {
  private temperatureService = inject(TemperatureService);

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private rootSvg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private chartGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;

  private width = 700;
  private height = 300;
  private margin = { top: 30, right: 20, bottom: 40, left: 60 };

  constructor() {
    effect(() => {
      const data = this.temperatureService.minuteAverages();
      if (data.length) this.updateChart(data);
    });
  }

  ngOnInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    this.rootSvg?.remove();
  }

  private initChart(): void {
    const containerEl = this.chartContainer.nativeElement as HTMLElement;

    this.rootSvg = d3
      .select<HTMLElement, unknown>(containerEl)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('background', '#f9fafb')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    const defs = this.rootSvg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'lineGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00cc76')
      .attr('stop-opacity', 0.9);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00cc76')
      .attr('stop-opacity', 0.1);

    this.chartGroup = this.rootSvg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  private updateChart(data: MinuteAverage[]): void {
    // 🔹 Filtrar los datos solo hasta la hora actual
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutos desde medianoche

    const filteredData = data.filter(d => {
      const [h, m] = d.minute.split(':').map(Number);
      const minuteOfDay = h * 60 + m;
      return minuteOfDay <= currentTime; // solo hasta ahora
    });

    const normalizedData = filteredData.map(d => ({
      minute: d.minute.slice(0, 5),
      value: d.value,
    }));

    const innerWidth = this.width - this.margin.left - this.margin.right;
    const innerHeight = this.height - this.margin.top - this.margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, normalizedData.length - 1])
      .range([0, innerWidth]);

    const minVal = d3.min(normalizedData, d => d.value) ?? 0;
    const maxVal = d3.max(normalizedData, d => d.value) ?? 0;

    const y = d3
      .scaleLinear()
      .domain([minVal - 1, maxVal + 1])
      .range([innerHeight, 0]);

    this.chartGroup.selectAll('*').remove();

    // Rejilla
    this.chartGroup
      .append('g')
      .call(
        d3.axisLeft(y)
          .ticks(4)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .attr('stroke', '#d1d5db')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-dasharray', '3,3');

    // Ejes
    const xAxis = d3.axisBottom(
      d3.scalePoint(normalizedData.map((d, i) => i.toString()), [0, innerWidth])
    )
      .tickValues(
        normalizedData
          .map((_, i) => (i % 60 === 0 ? i.toString() : null))
          .filter((v): v is string => v !== null)
      )
      .tickFormat(i => normalizedData[+i].minute);

    this.chartGroup
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#374151');

    this.chartGroup
      .append('g')
      .call(d3.axisLeft(y).ticks(6))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#374151');

    // Área
    const areaGen = d3.area<MinuteAverage>()
      .x((_, i) => x(i))
      .y0(innerHeight)
      .y1(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    this.chartGroup
      .append('path')
      .datum(normalizedData)
      .attr('fill', 'url(#lineGradient)')
      .attr('opacity', 0.25)
      .attr('d', areaGen);

    // Línea principal
    const lineGen = d3.line<MinuteAverage>()
      .x((_, i) => x(i))
      .y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = this.chartGroup
      .append('path')
      .datum(normalizedData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#lineGradient)')
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineGen)
      .style('pointer-events', 'none');

    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Tooltip (más grande y bonito)
    d3.select(this.chartContainer.nativeElement).selectAll('div').remove();

    const tooltip = d3.select(this.chartContainer.nativeElement)
      .append('div')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px 14px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('pointer-events', 'none')
      .style('color', '#111')
      .style('box-shadow', '0 4px 10px rgba(0,0,0,0.15)')
      .style('display', 'none');

    // Overlay invisible
    const overlay = this.chartGroup
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    const hoverLine = this.chartGroup
      .append('line')
      .attr('stroke', '#00cc76')
      .attr('stroke-width', 1)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('display', 'none');

    const focusCircle = this.chartGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#00cc76')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('display', 'none');

    // --- Interactividad mejorada ---
    let lastSelected: number | null = null;

    overlay.on('mousemove', (event) => {
      const [mx] = d3.pointer(event);
      const x0 = x.invert(mx);
      const i = Math.max(0, Math.min(Math.round(x0), normalizedData.length - 1));
      lastSelected = i;

      const d = normalizedData[i];
      const cx = x(i);
      const cy = y(d.value);

      hoverLine
        .style('display', 'block')
        .attr('x1', cx)
        .attr('x2', cx);

      focusCircle
        .style('display', 'block')
        .attr('cx', cx)
        .attr('cy', cy);

      tooltip
        .style('display', 'block')
        .style('left', `${event.offsetX + 20}px`)
        .style('top', `${event.offsetY - 35}px`)
        .html(`<strong>${d.minute}</strong><br>${d.value.toFixed(2)} °C`);
    });

    // 🧠 NO ocultamos en mouseleave → mantiene la selección
    this.rootSvg.on('mouseleave', () => {
      if (lastSelected !== null) {
        // Mantiene el último valor visible sin parpadear
        const d = normalizedData[lastSelected];
        const cx = x(lastSelected);
        const cy = y(d.value);
        hoverLine
          .style('display', 'block')
          .attr('x1', cx)
          .attr('x2', cx);
        focusCircle
          .style('display', 'block')
          .attr('cx', cx)
          .attr('cy', cy);
        tooltip
          .style('display', 'block')
          .style('left', `${cx + this.margin.left + 25}px`)
          .style('top', `${cy + this.margin.top - 35}px`)
          .html(`<strong>${d.minute}</strong><br>${d.value.toFixed(2)} °C`);
      }
    });
  }
}
