import * as d3 from "d3";

export function setupChart1(containerId) {
  const margin = { top: 50, right: 100, bottom: 50, left: 80 },
      width = 1000 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  const svg = d3.select(`#${containerId}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right + 100)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const label = d3.select(`#${containerId}`).append("div")
      .attr("id", "toggle-label")
      .style("margin-bottom", "10px")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Currently showing: Max Temperature");

  const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border", "1px solid black")
      .style("display", "none");

  d3.csv("temperature_daily.csv").then(data => {
    data.forEach(d => {
      d.date = new Date(d.date);
      d.year = d.date.getFullYear();
      d.month = d.date.getMonth();
      d.max_temperature = +d.max_temperature;
      d.min_temperature = +d.min_temperature;
    });

    const tempValues = data.flatMap(d => [d.max_temperature, d.min_temperature]);
    const tempMin = d3.min(tempValues);
    const tempMax = d3.max(tempValues);
    const colorScale = d3.scaleSequential(d3.interpolateOrRd).domain([tempMin, tempMax]);

    const nestedData = d3.rollups(data,
        v => ({ max: d3.max(v, d => d.max_temperature), min: d3.min(v, d => d.min_temperature) }),
        d => d.year, d => d.month);

    const years = [...new Set(data.map(d => d.year))];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const xScale = d3.scaleBand().domain(years).range([0, width]).padding(0.05);
    const yScale = d3.scaleBand().domain(d3.range(12)).range([0, height]).padding(0.05);

    svg.append("g").call(d3.axisTop(xScale));
    svg.append("g").call(d3.axisLeft(yScale).tickFormat(d => months[d]));

    let showMax = true;

    function update() {
      svg.selectAll("rect").remove();

      svg.selectAll("rect")
          .data(nestedData.flatMap(([year, months]) => months.map(([month, temps]) => ({ year, month, temp: showMax ? temps.max : temps.min, max: temps.max, min: temps.min }))))
          .enter().append("rect")
          .attr("x", d => xScale(d.year))
          .attr("y", d => yScale(d.month))
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .attr("fill", d => colorScale(d.temp))
          .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`Date: ${d.year}-${d.month + 1}<br>
                               Max Temp: ${d.max}°C<br>
                               Min Temp: ${d.min}°C`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
          })
          .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", () => tooltip.style("display", "none"));

      // Ensure the legend persists on toggle
      svg.select(".legend-group").remove();
      const legend = svg.append("g").attr("class", "legend-group").attr("transform", `translate(${width + 20}, 10)`);
      const legendScale = d3.scaleLinear().domain(colorScale.domain()).range([100, 0]);

      legend.selectAll("rect")
          .data(d3.range(10).map(i => colorScale.domain()[0] + (colorScale.domain()[1] - colorScale.domain()[0]) * (i / 9)))
          .enter().append("rect")
          .attr("y", d => legendScale(d))
          .attr("width", 20)
          .attr("height", 10)
          .attr("fill", d => colorScale(d));

      legend.append("g").attr("transform", "translate(20, 0)").call(d3.axisRight(legendScale).ticks(5));
    }

    update();

    d3.select(`#${containerId}`).append("button")
        .text("Toggle Max/Min")
        .on("click", () => {
          showMax = !showMax;
          label.text(`Currently showing: ${showMax ? "Max" : "Min"} Temperature`);
          update();
        });
  });
}

setupChart1("chart-1");