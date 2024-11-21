// alcohol-viz.js
class AlcoholVisualization {
    constructor() {
        this.margin = { top: 40, right: 30, bottom: 60, left: 60 };
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.data = null;
        this.currentYear = '2023';
    }

    // Load and process data
    async loadData() {
        try {
            // Show loading state
            d3.select('#consumptionTrends .loading').style('display', 'block');
    
            const response = await fetch('../data/alcohol_consumption.csv');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const csvText = await response.text();
    
            // Parse CSV data with error checking
            const parsedData = d3.csvParse(csvText, d => {
                // Validate required fields
                if (!d.REF_AREA || !d.TIME_PERIOD || !d.OBS_VALUE) {
                    console.warn('Missing required fields in row:', d);
                    return null;
                }
                
                return {
                    country: d.REF_AREA,
                    year: d.TIME_PERIOD,
                    value: +d.OBS_VALUE,
                    age: d.AGE === 'Y_GE15' ? '15 years or over' : d.AGE,
                    measure: d.MEASURE === 'AC' ? 'Alcohol consumption' : d.MEASURE,
                    status: d.OBS_STATUS
                };
            }).filter(d => d !== null); // Remove invalid rows
    
            this.data = parsedData;
            await this.initializeVisualizations();
    
            // Hide loading state after everything is rendered
            d3.select('#consumptionTrends .loading').style('display', 'none');
        } catch (error) {
            console.error('Error loading data:', error);
    
            // Show error state and hide loading
            d3.select('#consumptionTrends .loading').style('display', 'none');
            d3.select('#error-container')
                .style('display', 'block')
                .html(`<p>Error loading data: ${error.message}</p>`);
        }
    }

    updateMainVisualization() {
        // Clear existing visualization
        const container = d3.select('#consumptionTrends');
        container.select('svg').remove();
    
        const filteredData = this.data.filter(d => 
            d.year === this.currentYear && 
            d.measure === 'AC' // Alcohol consumption only
        );
    
        // Sort data by value
        filteredData.sort((a, b) => d3.descending(a.value, b.value));
    
        // Create SVG
        const svg = container.append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    
        // Create scales
        const x = d3.scaleBand()
            .range([0, this.width])
            .domain(filteredData.map(d => d.country))
            .padding(0.1);
    
        const y = d3.scaleLinear()
            .range([this.height, 0])
            .domain([0, d3.max(filteredData, d => d.value)]);
    
        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');
    
        svg.append('g')
            .call(d3.axisLeft(y).ticks(10));
    
        // Add bars
        svg.selectAll('rect')
            .data(filteredData)
            .enter()
            .append('rect')
            .attr('x', d => x(d.country))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => this.height - y(d.value))
            .attr('fill', 'steelblue');
    
        // Add title
        svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .text(`Alcohol Consumption by Country (${this.currentYear})`);
    
        // Add y-axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Liters per Person');
    }

    // Initialize all visualizations
    initializeVisualizations() {
        this.updateOverviewStats();
        this.createMainVisualization();
        this.createTrendsVisualization();
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        const yearSelect = document.querySelector('#yearSelect');

        if (yearSelect) {
            yearSelect.addEventListener('change', (event) => {
                this.currentYear = event.target.value;
                this.updateMainVisualization();
            });
        }
    }

    // Update overview statistics
    updateOverviewStats() {
        // Implement statistics calculations and display
        // Similar to tobacco-viz example
    }

    // Create trends over time visualization
    createTrendsVisualization() {
        // Implement additional visualization for alcohol consumption trends over time
        // Refer to the code provided in alcohol-viz.js for the time series chart
    }

    // Create main visualization
    createMainVisualization() {
        // Remove loading message
        d3.select('#consumptionTrends .loading').remove();
    
        const svg = d3.select('#consumptionTrends')
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    
        // Add title
        svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .text('Alcohol Consumption by Country');
    
        this.updateMainVisualization();
    }
}

// Initialize visualization
document.addEventListener('DOMContentLoaded', () => {
    const viz = new AlcoholVisualization();
    viz.loadData();
});

export default AlcoholVisualization;