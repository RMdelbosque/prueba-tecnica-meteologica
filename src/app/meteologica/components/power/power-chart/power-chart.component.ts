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
import { PowerService } from '../../../services/weather/power.service';

interface MinuteAverage {
  minute: string;
  value: number;
}

@Component({
  selector: 'power-chart',
  imports: [],
  templateUrl: './power-chart.component.html',
})
export class PowerChartComponent implements OnInit, OnDestroy {
  private powerService = inject(PowerService);

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private rootSvg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private chartGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;

  private width = 700;
  private height = 300;
  private margin = { top: 30, right: 20, bottom: 40, left: 60 };

  constructor() {
    // Redibuja cada vez que cambian los datos
    effect(() => {
      const data = this.powerService.minuteAverages();
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

    // SVG raíz con fondo claro
    this.rootSvg = d3
      .select<HTMLElement, unknown>(containerEl)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('background', '#f9fafb') // fondo gris claro
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // Definición de gradiente para la línea y el área
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

    // Grupo principal
    this.chartGroup = this.rootSvg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  private updateChart(data: MinuteAverage[]): void {
    const normalizedData = data.map(d => ({
      minute: d.minute.slice(0, 5),
      value: d.value,
    }));

    const innerWidth = this.width - this.margin.left - this.margin.right;
    const innerHeight = this.height - this.margin.top - this.margin.bottom;

    const x = d3
      .scaleBand<string>()
      .domain(normalizedData.map(d => d.minute))
      .range([0, innerWidth])
      .padding(0.1);

    const minVal = d3.min(normalizedData, d => d.value) ?? 0;
    const maxVal = d3.max(normalizedData, d => d.value) ?? 0;

    const y = d3
      .scaleLinear()
      .domain([minVal - 1, maxVal + 1])
      .range([innerHeight, 0]);

    // Limpiar contenido anterior
    this.chartGroup.selectAll('*').remove();

    // Rejilla horizontal punteada
    this.chartGroup
      .append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(4)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .attr('stroke', '#d1d5db')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-dasharray', '4,4');

    // Eje X
    this.chartGroup
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(x)
          .tickValues(x.domain().filter((_, i) => i % 60 === 0)) // cada 30 min
      )
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#374151');

    // Eje Y
    this.chartGroup
      .append('g')
      .call(d3.axisLeft(y).ticks(6))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#374151');

    // Área bajo la línea
    const areaGen = d3.area<MinuteAverage>()
      .x(d => x(d.minute)! + x.bandwidth() / 2)
      .y0(innerHeight)
      .y1(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    this.chartGroup
      .append('path')
      .datum(normalizedData)
      .attr('fill', 'url(#lineGradient)')
      .attr('opacity', 0.3)
      .attr('d', areaGen);

    // Línea principal
    const lineGen = d3.line<MinuteAverage>()
      .x(d => x(d.minute)! + x.bandwidth() / 2)
      .y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = this.chartGroup
      .append('path')
      .datum(normalizedData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#lineGradient)')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0px 2px 3px rgba(0,0,0,0.15))')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineGen);

    // Animación de dibujo
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);
  }
}
