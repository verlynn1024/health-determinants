// Data
const healthDeterminantsData = {
    "determinants": [
      {
        "country": "FR",
        "year": 2020,
        "smokingRate": 31.9,
        "alcoholConsumption": 11.4,
        "obesityRate": 21.6,
        "fruitConsumption": 113.7
      },
      {
        "country": "DE",
        "year": 2020,
        "smokingRate": 28.0,
        "alcoholConsumption": 10.6,
        "obesityRate": 22.3,
        "fruitConsumption": 95.2
      },
      {
        "country": "IT",
        "year": 2020,
        "smokingRate": 23.7,
        "alcoholConsumption": 7.8,
        "obesityRate": 19.9,
        "fruitConsumption": 124.3
      },
      {
        "country": "ES",
        "year": 2020,
        "smokingRate": 27.9,
        "alcoholConsumption": 10.0,
        "obesityRate": 23.8,
        "fruitConsumption": 101.8
      },
      {
        "country": "SE",
        "year": 2020,
        "smokingRate": 18.9,
        "alcoholConsumption": 7.2,
        "obesityRate": 20.6,
        "fruitConsumption": 88.5
      }
    ]
  };
  
  const countryNames = {
    "FR": "France",
    "DE": "Germany",
    "IT": "Italy",
    "ES": "Spain",
    "SE": "Sweden"
  };
  
  function createHealthDeterminantsChart() {
    // Set up dimensions and margins
    const margin = { top: 50, right: 50, bottom: 70, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    // Create SVG
    const svg = d3.select("#health-determinants-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Set up scales
    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .range([height, 0]);
  
    // Set up color scale
    const color = d3.scaleOrdinal()
      .domain(["smokingRate", "alcoholConsumption", "obesityRate", "fruitConsumption"])
      .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);
  
    // Set up axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
  
    // Prepare data
    const data = healthDeterminantsData.determinants.map(d => ({
      country: countryNames[d.country],
      smokingRate: d.smokingRate,
      alcoholConsumption: d.alcoholConsumption,
      obesityRate: d.obesityRate,
      fruitConsumption: d.fruitConsumption / 10 // Scaling down fruit consumption for better visualization
    }));
  
    // Set domains
    x.domain(data.map(d => d.country));
    y.domain([0, d3.max(data, d => Math.max(d.smokingRate, d.alcoholConsumption, d.obesityRate, d.fruitConsumption))]);
  
    // Add x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
  
    // Add y-axis
    svg.append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");
  
    // Create grouped bar chart
    const determinants = ["smokingRate", "alcoholConsumption"];
    const groupWidth = x.bandwidth();
    const barWidth = groupWidth / determinants.length;
  
    determinants.forEach((determinant, i) => {
      svg.selectAll(`.bar-${determinant}`)
        .data(data)
        .enter().append("rect")
        .attr("class", `bar-${determinant}`)
        .attr("x", d => x(d.country) + i * barWidth)
        .attr("width", barWidth)
        .attr("y", d => y(d[determinant]))
        .attr("height", d => height - y(d[determinant]))
        .attr("fill", color(determinant));
    });
  
    // Add legend
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(determinants.slice().reverse())
      .enter().append("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);
  
    legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", color);
  
    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d);
  
    // Add tooltips
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");
  
    svg.selectAll("rect")
      .on("mouseover", function(event, d) {
        const determinant = this.getAttribute("class").split("-")[1];
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${d.country}<br>${determinant}: ${d[determinant]}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }
  
  // Call the function to create the chart when the DOM is loaded
  document.addEventListener('DOMContentLoaded', createHealthDeterminantsChart);