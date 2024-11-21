// weight-viz.js
async function initializeWeightViz() {
    try {
      // Hardcoded data
      const data = [
        { country: "USA", year: 1997, value: 44.3, sex: "M", methodology: "Self-reporting" },
        { country: "USA", year: 1998, value: 44.4, sex: "M", methodology: "Self-reporting" },
        { country: "USA", year: 1999, value: 45.1, sex: "M", methodology: "Self-reporting" },
        { country: "USA", year: 2000, value: 45.7, sex: "M", methodology: "Self-reporting" },
        { country: "USA", year: 1997, value: 40.2, sex: "F", methodology: "Self-reporting" },
        { country: "USA", year: 1998, value: 40.8, sex: "F", methodology: "Self-reporting" },
        { country: "USA", year: 1999, value: 41.3, sex: "F", methodology: "Self-reporting" },
        { country: "USA", year: 2000, value: 41.9, sex: "F", methodology: "Self-reporting" },
        { country: "GBR", year: 1997, value: 37.6, sex: "M", methodology: "Self-reporting" },
        { country: "GBR", year: 1998, value: 38.1, sex: "M", methodology: "Self-reporting" },
        { country: "GBR", year: 1999, value: 38.4, sex: "M", methodology: "Self-reporting" },
        { country: "GBR", year: 2000, value: 39.0, sex: "M", methodology: "Self-reporting" },
        { country: "GBR", year: 1997, value: 34.9, sex: "F", methodology: "Self-reporting" },
        { country: "GBR", year: 1998, value: 35.2, sex: "F", methodology: "Self-reporting" },
        { country: "GBR", year: 1999, value: 35.7, sex: "F", methodology: "Self-reporting" },
        { country: "GBR", year: 2000, value: 36.2, sex: "F", methodology: "Self-reporting" },
      ];
  
      // Update statistics cards
      updateStatCards(data);
  
      // Create main BMI distribution visualization
      createBMIDistribution(data);
      
      // Create gender comparison visualization  
      createGenderComparison(data);
  
    } catch (error) {
      console.error('Error processing data:', error); 
      displayError();
    }
  }
  
  function updateStatCards(data) {
    const latestYear = d3.max(data, d => d.year);
    const latestData = data.filter(d => d.year === latestYear);
  
    // Overall prevalence
    const overallPrevalence = d3.mean(latestData, d => d.value);  
    d3.select('#overallPrevalence')
      .text(`${overallPrevalence.toFixed(1)}%`);
  
    // Male prevalence  
    const maleData = latestData.filter(d => d.sex === 'M');
    const malePrevalence = d3.mean(maleData, d => d.value); 
    d3.select('#malePrevalence')
      .text(`${malePrevalence.toFixed(1)}%`);
  
    // Female prevalence
    const femaleData = latestData.filter(d => d.sex === 'F'); 
    const femalePrevalence = d3.mean(femaleData, d => d.value);
    d3.select('#femalePrevalence') 
      .text(`${femalePrevalence.toFixed(1)}%`);
      
    // Calculate trend  
    const earliestYear = d3.min(data, d => d.year);
    const earliestData = data.filter(d => d.year === earliestYear);
    const earliestMean = d3.mean(earliestData, d => d.value);
    const trend = overallPrevalence - earliestMean;
    const trendSymbol = trend >= 0 ? '+' : '';
    d3.select('#trendValue')
      .text(`${trendSymbol}${trend.toFixed(1)}%`)
      .style('color', trend >= 0 ? '#e74c3c' : '#27ae60');
  }
  
  function createBMIDistribution(data) {
    // Set up dimensions 
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };  
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG container
    const svg = d3.select('#bmiDistribution')  
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')  
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Get latest year data
    const latestYear = d3.max(data, d => d.year);
    const latestData = data.filter(d => d.year === latestYear);
  
    // Create scales
    const xScale = d3.scaleBand() 
      .domain(latestData.map(d => d.country))
      .range([0, width])  
      .padding(0.1);
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(latestData, d => d.value)]) 
      .range([height, 0]);
    
    // Create and add axes 
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(10);
  
    // Add X axis  
    svg.append('g')
      .attr('class', 'x-axis') 
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)  
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em') 
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
          
    // Add Y axis
    svg.append('g') 
      .attr('class', 'y-axis')
      .call(yAxis);
          
    // Create tooltip  
    const tooltip = d3.select('#bmiDistribution')
      .append('div')   
      .attr('class', 'tooltip')
      .style('opacity', 0);
          
    // Add bars 
    svg.selectAll('rect')
      .data(latestData)  
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.country))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())  
      .attr('height', d => height - yScale(d.value))
      .attr('fill', '#3498db') 
      .on('mouseover', function(event, d) {
        d3.select(this)  
          .transition()
          .duration(200)
          .attr('fill', '#2980b9');
                  
        tooltip.transition()
          .duration(200)  
          .style('opacity', .9);
                  
        tooltip.html(`
          <strong>${d.country}</strong><br/>
          Year: ${d.year}<br/>  
          Overweight: ${d.value.toFixed(1)}%<br/>
          Method: ${d.methodology}   
        `)
          .style('left', (event.pageX + 10) + 'px') 
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition() 
          .duration(200)
          .attr('fill', '#3498db');
                  
        tooltip.transition()
          .duration(500) 
          .style('opacity', 0);
      });
          
    // Add labels
    svg.append('text')
      .attr('transform', 'rotate(-90)')   
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))  
      .attr('dy', '1em')
      .style('text-anchor', 'middle')  
      .text('Percentage of Population (%)');
          
    svg.append('text')  
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))   
      .attr('text-anchor', 'middle')
      .style('font-size', '16px') 
      .text('Overweight Population Distribution by Country');
  }
  
  function createGenderComparison(data) {  
    // Set up dimensions for gender comparison charts
    const margin = { top: 30, right: 20, bottom: 50, left: 50 };
    const width = 400 - margin.left - margin.right; 
    const height = 300 - margin.top - margin.bottom;
  
    // Create time scales for trend lines 
    const years = [...new Set(data.map(d => d.year))].sort();
      
    // Male data
    createGenderTrend(
      data.filter(d => d.sex === 'M'),
      '#maleChart',  
      width, 
      height,
      margin, 
      years,
      'Male Population Trends',
      '#3498db'  
    );
      
    // Female data 
    createGenderTrend(
      data.filter(d => d.sex === 'F'),
      '#femaleChart', 
      width,
      height, 
      margin,
      years, 
      'Female Population Trends',
      '#e74c3c'   
    );
  }
  
  function createGenderTrend(data, selector, width, height, margin, years, title, color) {
    const svg = d3.select(selector) 
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom) 
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Create scales  
    const xScale = d3.scaleLinear() 
      .domain(d3.extent(years))
      .range([0, width]); 
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height, 0]); 
          
    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.year))  
      .y(d => yScale(d.value));
          
    // Add line path 
    svg.append('path')
      .datum(data) 
      .attr('fill', 'none')
      .attr('stroke', color) 
      .attr('stroke-width', 2)
      .attr('d', line);  
          
    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d')); 
    const yAxis = d3.axisLeft(yScale);
  
    svg.append('g')
      .attr('class', 'x-axis')  
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);  
  
    svg.append('g') 
      .attr('class', 'y-axis')
      .call(yAxis); 
          
    // Add title
    svg.append('text')
      .attr('x', width / 2) 
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle') 
      .style('font-size', '14px')
      .text(title);
  }  
  
  function displayError() {
    const containers = ['#bmiDistribution', '#maleChart', '#femaleChart'];
    containers.forEach(container => {  
      d3.select(container)
        .append('p')
        .attr('class', 'error-message') 
        .text('Error loading visualization. Please try again later.');
    }); 
  }
  
  // Initialize visualization when the DOM is loaded
  document.addEventListener('DOMContentLoaded', initializeWeightViz);