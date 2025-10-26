import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnInit,
  OnDestroy,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import * as d3 from 'd3';

export interface ChartPoint {
  minute: string; // time in format "HH:MM" or "HH:MM:SS"
  value: number;
}

@Component({
  selector: 'line-chart',
  imports: [],
  templateUrl: './line-chart.component.html',
})
export class LineChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: ChartPoint[] = [];
  @Input() color = '#00cc76';
  @Input() width = 700;
  @Input() height = 300;
  @Input() unit = '°C';

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private rootSvg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private chartGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private margin = { top: 30, right: 20, bottom: 40, left: 60 };

  // Keep track of current selection and tooltip state
  private lastSelectedIndex: number | null = null;
  private lastTooltipPos: { left: number; top: number } | null = null;
  private isHovering = false;

  ngOnInit(): void {
    this.initChart();
    if (this.data?.length) this.updateChart(this.data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rootSvg && (changes['data'] || changes['color'])) {
      this.updateChart(this.data);
    }
  }

  ngOnDestroy(): void {
    this.rootSvg?.remove();
  }

  // Create the SVG element and gradient definition
  private initChart(): void {
    const containerEl = this.chartContainer.nativeElement as HTMLElement;

    this.rootSvg = d3
      .select(containerEl)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)

      .style('width', '100%')
      .style('height', 'auto');

    const defs = this.rootSvg.append('defs');
    const gradientId = `lineGradient-${this.color.replace('#', '')}`;

    // Define the gradient for the line and area fill
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.color)
      .attr('stop-opacity', 0.9);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', this.color)
      .attr('stop-opacity', 0.1);

    this.chartGroup = this.rootSvg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  // Draw or update the chart with the given data
  private updateChart(inputData: ChartPoint[]): void {
    if (!inputData || inputData.length === 0) return;

    // Filter data up to the current time
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const filtered = inputData.filter((d) => {
      const [h, m] = d.minute.split(':').map(Number);
      return h * 60 + m <= nowMinutes;
    });

    // Simplify time format (HH:MM only)
    const normalizedData = filtered.map((d) => ({
      minute: d.minute.slice(0, 5),
      value: d.value,
    }));

    const innerWidth = this.width - this.margin.left - this.margin.right;
    const innerHeight = this.height - this.margin.top - this.margin.bottom;

    // Create scales for X and Y axes
    const x = d3
      .scaleLinear()
      .domain([0, normalizedData.length - 1])
      .range([0, innerWidth]);

    const minVal = d3.min(normalizedData, (d) => d.value) ?? 0;
    const maxVal = d3.max(normalizedData, (d) => d.value) ?? 0;

    const y = d3
      .scaleLinear()
      .domain([minVal - 1, maxVal + 1])
      .range([innerHeight, 0]);

    // Clear any previous elements before redrawing
    this.chartGroup.selectAll('*').remove();

    // Grid lines (without text)
    this.chartGroup
      .append('g')
      .call(
        d3.axisLeft(y)
          .ticks(4)
          .tickSize(-innerWidth)
          .tickFormat(() => '') // no text for grid
      )
      .attr('stroke', '#d1d5db')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-dasharray', '3,3');

    // X axis
    const xAxisScale = d3.scalePoint(
      normalizedData.map((_, i) => i.toString()),
      [0, innerWidth]
    );

    const xAxis = d3
      .axisBottom(xAxisScale)
      .tickValues(
        normalizedData
          .map((_, i) => (i % 60 === 0 ? i.toString() : null))
          .filter((v): v is string => v !== null)
      )
      .tickFormat((i) => normalizedData[+i].minute);

    // X axis
    this.chartGroup
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#374151');

    // Y axis with unit labels
    this.chartGroup
      .append('g')
      .call(
        d3.axisLeft(y)
          .ticks(6)
          .tickFormat((d) => `${d} ${this.unit}`) // add unit only here
      )
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#374151');

    // Area fill under the line
    const gradientId = `lineGradient-${this.color.replace('#', '')}`;
    const areaGen = d3
      .area<{ minute: string; value: number }>()
      .x((_, i) => x(i))
      .y0(innerHeight)
      .y1((d) => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    this.chartGroup
      .append('path')
      .datum(normalizedData)
      .attr('fill', `url(#${gradientId})`)
      .attr('opacity', 0.25)
      .attr('d', areaGen);

    // Main line
    const lineGen = d3
      .line<{ minute: string; value: number }>()
      .x((_, i) => x(i))
      .y((d) => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = this.chartGroup
      .append('path')
      .datum(normalizedData)
      .attr('fill', 'none')
      .attr('stroke', `url(#${gradientId})`)
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineGen)
      .style('pointer-events', 'none');

    // Line animation on load
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Tooltip and hover elements
    const tooltip = d3
      .select(this.chartContainer.nativeElement)
      .selectAll<HTMLDivElement, unknown>('div.chart-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'chart-tooltip')
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

    const hoverLine = this.chartGroup
      .append('line')
      .attr('stroke', this.color)
      .attr('stroke-width', 1)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('display', 'none');

    const focusCircle = this.chartGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', this.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('display', 'none');

    // Transparent rectangle to detect mouse movement
    const overlay = this.chartGroup
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    // Draw the hover line, circle, and tooltip at a given position
    const showSelection = (
      index: number,
      leftPx: number,
      topPx: number
    ) => {
      const d = normalizedData[index];
      const cx = x(index);
      const cy = y(d.value);

      hoverLine.style('display', 'block').attr('x1', cx).attr('x2', cx);
      focusCircle.style('display', 'block').attr('cx', cx).attr('cy', cy);

      tooltip
        .style('display', 'block')
        .style('left', `${leftPx}px`)
        .style('top', `${topPx}px`)
        .html(
          `<strong>${d.minute}</strong><br>${d.value.toFixed(2)} ${this.unit}`
        );
    };

    // When the mouse moves inside the chart
    overlay.on('mousemove', (event: MouseEvent) => {
      this.isHovering = true;

      const [mx] = d3.pointer(event);
      const i = Math.max(
        0,
        Math.min(Math.round(x.invert(mx)), normalizedData.length - 1)
      );

      // Calculate tooltip position relative to the container
      const containerRect =
        this.chartContainer.nativeElement.getBoundingClientRect();
      const leftPx = event.clientX - containerRect.left + 12;
      const topPx = event.clientY - containerRect.top - 40;

      // Save current selection and tooltip position
      this.lastSelectedIndex = i;
      this.lastTooltipPos = { left: leftPx, top: topPx };

      showSelection(i, leftPx, topPx);
    });

    // When the mouse leaves the chart area
    overlay.on('mouseleave', () => {
      this.isHovering = false;
      this.lastSelectedIndex = null;
      this.lastTooltipPos = null;

      hoverLine.style('display', 'none');
      focusCircle.style('display', 'none');
      tooltip.style('display', 'none');
    });

    // If the chart is redrawn while hovering, restore the same visual position
    if (
      this.isHovering &&
      this.lastSelectedIndex !== null &&
      this.lastTooltipPos !== null &&
      this.lastSelectedIndex < normalizedData.length
    ) {
      showSelection(
        this.lastSelectedIndex,
        this.lastTooltipPos.left,
        this.lastTooltipPos.top
      );
    }
  }
}
