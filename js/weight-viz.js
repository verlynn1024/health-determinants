// weight-viz.js
class WeightVisualization {
  constructor() {
      // Prevent multiple instances
      if (WeightVisualization.instance) {
          return WeightVisualization.instance;
      }
      WeightVisualization.instance = this;

      // Set up visualization dimensions
      this.margin = { top: 40, right: 20, bottom: 60, left: 60 };
      this.width = 600 - this.margin.left - this.margin.right;
      this.height = 400 - this.margin.top - this.margin.bottom;
      
      // Gender comparison dimensions
      this.genderMargin = { top: 30, right: 20, bottom: 50, left: 50 };
      this.genderWidth = 400 - this.genderMargin.left - this.genderMargin.right;
      this.genderHeight = 300 - this.genderMargin.top - this.genderMargin.bottom;

      this.data = null;
      this.currentYear = '2020';
  }

  // Initialize the visualization
  async initialize() {
      try {
          // Show loading states
          this.showLoading();
          
          // Load data (replace with actual data loading when ready)
          this.data = [
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
              { country: "GBR", year: 2000, value: 36.2, sex: "F", methodology: "Self-reporting" }
          ];

          // Initialize all visualizations
          await this.initializeVisualizations();
          
          // Hide loading states
          this.hideLoading();
      } catch (error) {
          console.error('Error initializing visualization:', error);
          this.displayError();
      }
  }

  showLoading() {
      const containers = ['#bmiDistribution', '#maleChart', '#femaleChart'];
      containers.forEach(container => {
          d3.select(container)
              .append('div')
              .attr('class', 'loading')
              .text('Loading...');
      });
  }

  hideLoading() {
      d3.selectAll('.loading').remove();
  }

  async initializeVisualizations() {
      this.updateStatCards();
      this.createBMIDistribution();
      this.createGenderComparison();
  }

  updateStatCards() {
      const latestYear = d3.max(this.data, d => d.year);
      const latestData = this.data.filter(d => d.year === latestYear);

      // Clear existing content
      d3.selectAll('.stat-value').html('');

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
      const earliestYear = d3.min(this.data, d => d.year);
      const earliestData = this.data.filter(d => d.year === earliestYear);
      const earliestMean = d3.mean(earliestData, d => d.value);
      const trend = overallPrevalence - earliestMean;
      const trendSymbol = trend >= 0 ? '+' : '';
      d3.select('#trendValue')
          .text(`${trendSymbol}${trend.toFixed(1)}%`)
          .style('color', trend >= 0 ? '#e74c3c' : '#27ae60');
  }

  createBMIDistribution() {
      // Clear existing content
      d3.select('#bmiDistribution').selectAll('*').remove();

      const svg = d3.select('#bmiDistribution')
          .append('svg')
          .attr('width', this.width + this.margin.left + this.margin.right)
          .attr('height', this.height + this.margin.top + this.margin.bottom)
          .append('g')
          .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

      // Get latest year data
      const latestYear = d3.max(this.data, d => d.year);
      const latestData = this.data.filter(d => d.year === latestYear);

      // Create scales
      const xScale = d3.scaleBand()
          .domain(latestData.map(d => d.country))
          .range([0, this.width])
          .padding(0.1);

      const yScale = d3.scaleLinear()
          .domain([0, d3.max(latestData, d => d.value)])
          .range([this.height, 0]);

      // Add axes
      svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${this.height})`)
          .call(d3.axisBottom(xScale))
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-45)');

      svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(yScale).ticks(10));

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
          .attr('height', d => this.height - yScale(d.value))
          .attr('fill', '#3498db')
          .on('mouseover', (event, d) => {
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
          .on('mouseout', () => {
              tooltip.transition()
                  .duration(500)
                  .style('opacity', 0);
          });

      // Add labels
      svg.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - this.margin.left)
          .attr('x', 0 - (this.height / 2))
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .text('Percentage of Population (%)');

      svg.append('text')
          .attr('x', this.width / 2)
          .attr('y', 0 - (this.margin.top / 2))
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .text('Overweight Population Distribution by Country');
  }

  createGenderComparison() {
      // Clear existing content
      d3.select('#maleChart').selectAll('*').remove();
      d3.select('#femaleChart').selectAll('*').remove();

      const years = [...new Set(this.data.map(d => d.year))].sort();

      // Create male and female trends
      this.createGenderTrend(
          this.data.filter(d => d.sex === 'M'),
          '#maleChart',
          'Male Population Trends',
          '#3498db'
      );

      this.createGenderTrend(
          this.data.filter(d => d.sex === 'F'),
          '#femaleChart',
          'Female Population Trends',
          '#e74c3c'
      );
  }

  createGenderTrend(data, selector, title, color) {
      const svg = d3.select(selector)
          .append('svg')
          .attr('width', this.genderWidth + this.genderMargin.left + this.genderMargin.right)
          .attr('height', this.genderHeight + this.genderMargin.top + this.genderMargin.bottom)
          .append('g')
          .attr('transform', `translate(${this.genderMargin.left},${this.genderMargin.top})`);

      const years = [...new Set(data.map(d => d.year))].sort();

      // Create scales
      const xScale = d3.scaleLinear()
          .domain(d3.extent(years))
          .range([0, this.genderWidth]);

      const yScale = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.value)])
          .range([this.genderHeight, 0]);

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
      const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
      const yAxis = d3.axisLeft(yScale);

      svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${this.genderHeight})`)
          .call(xAxis);

      svg.append('g')
          .attr('class', 'y-axis')
          .call(yAxis);

      // Add title
      svg.append('text')
          .attr('x', this.genderWidth / 2)
          .attr('y', 0 - (this.genderMargin.top / 2))
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(title);
  }

  displayError() {
      const containers = ['#bmiDistribution', '#maleChart', '#femaleChart'];
      containers.forEach(container => {
          d3.select(container)
              .selectAll('*').remove();
          d3.select(container)
              .append('p')
              .attr('class', 'error-message')
              .text('Error loading visualization. Please try again later.');
      });
  }
}

// Initialize visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const viz = new WeightVisualization();
  viz.initialize();
});

export default WeightVisualization;