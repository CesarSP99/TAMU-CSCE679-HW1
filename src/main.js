import * as d3 from 'd3';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export function setupChart1(containerId) {
  // Define the dimensions and margins of the graph
  const margin = { top: 50, right: 100, bottom: 50, left: 80 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  const svg = d3
    .select(`#${containerId}`)
    .append('svg')
    .attr('width', width + margin.left + margin.right + 100)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Append a div for the selected temperature type
  const label = d3
    .select(`#${containerId}`)
    .append('div')
    .attr('id', 'toggle-label')
    .style('margin-bottom', '10px')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Currently showing: Max Temperature');

  // Append a div for the tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('background', 'white')
    .style('padding', '5px')
    .style('border', '1px solid black')
    .style('display', 'none');

  const parseDate = d3.timeParse('%Y-%m-%d');

  // Load the data
  d3.csv('temperature_daily.csv').then((data) => {
    data.forEach((d) => {
      d.date = parseDate(d.date);
      d.year = d.date ? d.date.getFullYear() : null;
      d.month = d.date ? d.date.getMonth() : null;
      d.max_temperature = +d.max_temperature;
      d.min_temperature = +d.min_temperature;
    });

    // Create a color scale for the temperature values using the YlOrRd color scheme
    const tempValues = data.flatMap((d) => [
      d.max_temperature,
      d.min_temperature,
    ]);
    const tempMin = d3.min(tempValues);
    const tempMax = d3.max(tempValues);
    const colorScale = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([tempMin, tempMax]);

    // Group the data by year and month
    const nestedData = d3.rollups(
      data,
      (v) => ({
        max: d3.max(v, (d) => d.max_temperature),
        min: d3.min(v, (d) => d.min_temperature),
      }),
      (d) => d.year,
      (d) => d.month,
    );

    // Create scales
    const years = [...new Set(data.map((d) => d.year))];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const xScale = d3.scaleBand().domain(years).range([0, width]).padding(0.15);
    const yScale = d3
      .scaleBand()
      .domain(d3.range(12))
      .range([0, height])
      .padding(0.15);

    // Add the axes
    svg.append('g').call(d3.axisTop(xScale));
    svg.append('g').call(d3.axisLeft(yScale).tickFormat((d) => months[d]));

    // Variable to toggle between max and min temperature
    let showMax = true;

    // Update function to update the chart based on the selected temperature type
    function update() {
      svg.selectAll('rect').remove();

      svg
        .selectAll('rect')
        .data(
          nestedData.flatMap(([year, months]) =>
            months.map(([month, temps]) => ({
              year,
              month,
              temp: showMax ? temps.max : temps.min,
              max: temps.max,
              min: temps.min,
            })),
          ),
        )
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(d.year))
        .attr('y', (d) => yScale(d.month))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', (d) => colorScale(d.temp))
        .on('mouseover', (event, d) => {
          tooltip
            .style('display', 'block')
            .html(
              `Date: ${d.year}-${d.month + 1}<br>
                       Max Temp: ${d.max}°C<br>
                       Min Temp: ${d.min}°C`,
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        })
        .on('mouseout', () => tooltip.style('display', 'none'));

      svg.select('.legend-group').remove();
      const legend = svg
        .append('g')
        .attr('class', 'legend-group')
        .attr('transform', `translate(${width + 20}, 10)`);
      const legendScale = d3
        .scaleLinear()
        .domain(colorScale.domain())
        .range([100, 0]);

      legend
        .selectAll('rect')
        .data(
          d3
            .range(10)
            .map(
              (i) =>
                colorScale.domain()[0] +
                (colorScale.domain()[1] - colorScale.domain()[0]) * (i / 9),
            ),
        )
        .enter()
        .append('rect')
        .attr('y', (d) => legendScale(d))
        .attr('width', 20)
        .attr('height', 10)
        .attr('fill', (d) => colorScale(d));

      legend
        .append('g')
        .attr('transform', 'translate(20, 0)')
        .call(d3.axisRight(legendScale).ticks(5));
    }

    update();

    // Add a button to toggle between max and min temperature
    d3.select(`#${containerId}`)
      .append('button')
      .text('Toggle Max/Min')
      .on('click', () => {
        showMax = !showMax;
        label.text(`Currently showing: ${showMax ? 'Max' : 'Min'} Temperature`);
        update();
      });
  });
}

// This function sets up the second chart
export function setupChart2(containerId) {
  // Define the dimensions and margins of the graph
  const margin = { top: 50, right: 100, bottom: 50, left: 80 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  const svg = d3
    .select(`#${containerId}`)
    .append('svg')
    .attr('width', width + margin.left + margin.right + 100)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Append a div for the tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('background', 'white')
    .style('padding', '5px')
    .style('border', '1px solid black')
    .style('display', 'none');

  // Parse the date / time
  const parseDate = d3.timeParse('%Y-%m-%d');

  // Load the data
  d3.csv('temperature_daily.csv').then((data) => {
    data.forEach((d) => {
      d.date = parseDate(d.date);
      d.year = d.date ? d.date.getFullYear() : null;
      d.month = d.date ? d.date.getMonth() : null;
      d.day = d.date ? d.date.getDate() : null;
      d.max_temperature = +d.max_temperature;
      d.min_temperature = +d.min_temperature;
    });

    // Get the most recent 10 years
    const recentYears = [...new Set(data.map((d) => d.year))]
      .sort((a, b) => b - a)
      .slice(0, 10)
      .reverse();

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Group the data by year and month
    const nestedData = d3.group(
      data,
      (d) => d.year,
      (d) => d.month,
    );

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(recentYears)
      .range([0, width])
      .padding(0.15);
    const yScale = d3
      .scaleBand()
      .domain(d3.range(12))
      .range([0, height])
      .padding(0.15);

    // Create a color scale for the temperature values using the YlOrRd color scheme
    const tempValues = data.flatMap((d) => [
      d.max_temperature,
      d.min_temperature,
    ]);
    const tempMin = d3.min(tempValues);
    const tempMax = d3.max(tempValues);
    const colorScale = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([tempMin, tempMax]);

    // Add the axes
    svg.append('g').call(d3.axisTop(xScale));
    svg.append('g').call(d3.axisLeft(yScale).tickFormat((d) => months[d]));

    const cellWidth = xScale.bandwidth();
    const cellHeight = yScale.bandwidth();

    // Add the cells
    svg
      .selectAll('g.cell')
      .data(
        recentYears.flatMap((year) =>
          d3.range(12).map((month) => ({ year, month })),
        ),
      )
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr(
        'transform',
        (d) => `translate(${xScale(d.year)},${yScale(d.month)})`,
      )
      .each(function (d) {
        const cellGroup = d3.select(this);
        const monthData = nestedData.get(d.year)?.get(d.month) || [];

        if (monthData.length === 0) return;

        const avgTemp = d3.mean(monthData, (d) => d.max_temperature);
        cellGroup
          .append('rect')
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('fill', colorScale(avgTemp))
          .on('mouseover', (event) => {
            tooltip
              .style('display', 'block')
              .html(
                `Date: ${d.year}-${d.month + 1}<br> 
                           Max: ${d3.max(monthData, (d) => d.max_temperature)}°C <br> 
                           Min: ${d3.min(monthData, (d) => d.min_temperature)}°C`,
              )
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 10 + 'px');
          })
          .on('mouseout', () => tooltip.style('display', 'none'));

        // Mini line chart inside each square
        // Create scales
        const x = d3.scaleLinear().domain([1, 31]).range([0, cellWidth]);
        const y = d3
          .scaleLinear()
          .domain([tempMin, tempMax])
          .range([cellHeight, 0]);

        // Create the lines
        const lineMax = d3
          .line()
          .x((d) => x(d.day))
          .y((d) => y(d.max_temperature))
          .curve(d3.curveMonotoneX);

        const lineMin = d3
          .line()
          .x((d) => x(d.day))
          .y((d) => y(d.min_temperature))
          .curve(d3.curveMonotoneX);

        // Add the lines
        cellGroup
          .append('path')
          .datum(monthData)
          .attr('d', lineMax)
          .attr('stroke', 'green')
          .attr('fill', 'none')
          .attr('stroke-width', 1);

        cellGroup
          .append('path')
          .datum(monthData)
          .attr('d', lineMin)
          .attr('stroke', 'blue')
          .attr('fill', 'none')
          .attr('stroke-width', 1);
      });

    // Add a legend
    const legend = svg
      .append('g')
      .attr('class', 'legend-group')
      .attr('transform', `translate(${width + 20}, 10)`);
    const legendScale = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([100, 0]);

    // Add the legend rectangles
    legend
      .selectAll('rect')
      .data(
        d3
          .range(10)
          .map(
            (i) =>
              colorScale.domain()[0] +
              (colorScale.domain()[1] - colorScale.domain()[0]) * (i / 9),
          ),
      )
      .enter()
      .append('rect')
      .attr('y', (d) => legendScale(d))
      .attr('width', 20)
      .attr('height', 10)
      .attr('fill', (d) => colorScale(d));

    legend
      .append('g')
      .attr('transform', 'translate(20, 0)')
      .call(d3.axisRight(legendScale).ticks(5));

    legend
      .append('text')
      .attr('x', -10)
      .attr('y', 120)
      .text('Max Temp (Green)')
      .attr('fill', 'green')
      .style('font-size', '12px');

    legend
      .append('text')
      .attr('x', -10)
      .attr('y', 135)
      .text('Min Temp (Blue)')
      .attr('fill', 'blue')
      .style('font-size', '12px');
  });
}

// Call the functions to set up the charts
setupChart1('chart-1');
setupChart2('chart-2');
