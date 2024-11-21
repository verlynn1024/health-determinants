// Initialize the visualization
class TobaccoVisualization {
    constructor() {
        this.margin = { top: 40, right: 30, bottom: 60, left: 60 };
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.data = null;
        this.currentYear = '2023';
        this.currentView = 'bar';
    }

    // Load and process data
    async loadData() {
        try {
            // Show loading state
            d3.select('#smokingTrends .loading').style('display', 'block');
    
            const response = await fetch('../data/tobacco_consumption.csv');
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
                    country: d.REF_AREA || d['Reference area'],
                    year: d.TIME_PERIOD || d['Time period'],
                    demographic: d.SEX === '_T' ? 'Total' :
                               d.SEX === 'M' ? 'Male' :
                               d.SEX === 'F' ? 'Female' : 'Youth',
                    value: +d.OBS_VALUE || +d['Observation value'],
                    age: d.AGE === 'Y_GE15' ? '15 years or over' :
                         d.AGE === 'Y15T24' ? 'From 15 to 24 years' : d.AGE,
                    measure: d.MEASURE === 'SP_DS' ? 'Daily smokers' :
                            d.MEASURE === 'SP_RVPU' ? 'Vaping users' : d.MEASURE,
                    measureCode: d.MEASURE,
                    status: d.OBS_STATUS || d['Observation status']
                };
            }).filter(d => d !== null); // Remove invalid rows
    
            this.data = parsedData;
            await this.initializeVisualizations();
    
            // Hide loading state after everything is rendered
            d3.select('#smokingTrends .loading').style('display', 'none');
        } catch (error) {
            console.error('Error loading data:', error);
    
            // Show error state and hide loading
            d3.select('#smokingTrends .loading').style('display', 'none');
            d3.select('#error-container')
                .style('display', 'block')
                .html(`<p>Error loading data: ${error.message}</p>`);
        }
    }

    updateMainVisualization() {
        // Clear existing visualization
        const container = d3.select('#smokingTrends');
        container.select('svg').remove();
    
        const filteredData = this.data.filter(d => 
            d.year === this.currentYear && 
            d.measureCode === 'SP_DS' // Daily smokers only
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
            .domain([0, d3.max(filteredData, d => d.value) * 1.1]);
    
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
            .attr('fill', '#69b3a2');
    
        // Add title
        svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .text(`Smoking Rates by Country (${this.currentYear})`);
    
        // Add y-axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Percentage of Population (%)');
    }
    
    // Initialize all visualizations
    initializeVisualizations() {
        this.updateOverviewCards();
        this.createMainVisualization();
        this.createMiniVisualizations();
        this.setupEventListeners();
    }

    // Update overview statistics cards
    updateOverviewCards() {
        const latestYear = d3.max(this.data, d => d.year);
    
        // Daily smoking rate (15 years or over)
        const dailySmokingData = this.data.filter(d =>
            d.measureCode === 'SP_DS' &&
            d.year === latestYear &&
            d.age === '15 years or over' &&
            d.status !== 'D'
        );
        const dailySmokingRate = d3.mean(dailySmokingData, d => d.value) || 0;
    
        d3.select('#dailySmokingCard')
            .html(`
                <h3>Daily Smoking Rate</h3>
                <div class="stat-value">${dailySmokingRate.toFixed(1)}%</div>
                <div class="stat-year">Latest data: ${latestYear}</div>
            `);
    
        // Vaping rate
        const vapingData = this.data.filter(d =>
            d.measureCode === 'SP_RVPU' &&
            d.age === '15 years or over' &&
            d.status !== 'D'
        );
        const latestVapingYear = d3.max(vapingData, d => d.year);
        const latestVapingRate = d3.mean(
            vapingData.filter(d => d.year === latestVapingYear),
            d => d.value
        ) || 0;
    
        d3.select('#vapingCard')
            .html(`
                <h3>Vaping Product Usage</h3>
                <div class="stat-value">${latestVapingRate.toFixed(1)}%</div>
                <div class="stat-year">Latest data: ${latestVapingYear}</div>
            `);
    
        // Youth smoking rate (15-24 years)
        const youthData = this.data.filter(d =>
            d.measureCode === 'SP_DS' &&
            d.year === latestYear &&
            d.age === 'From 15 to 24 years' &&
            d.status !== 'D'
        );
        const youthRate = d3.mean(youthData, d => d.value) || 0;
    
        d3.select('#youthSmokingCard')
            .html(`
                <h3>Youth Smoking Rate (15-24)</h3>
                <div class="stat-value">${youthRate.toFixed(1)}%</div>
                <div class="stat-year">Latest data: ${latestYear}</div>
            `);
    
        // Add trend indicators
        this.updateTrends();
    }    

    // Calculate and update trend indicators
    updateTrends() {
        const calculateTrend = (data, currentYear, measureCode, age) => {
            const previousYear = (currentYear - 1).toString();
            const currentData = data.filter(d =>
                d.year === currentYear &&
                d.measureCode === measureCode &&
                d.age === age &&
                d.status !== 'D'
            );
            const previousData = data.filter(d =>
                d.year === previousYear &&
                d.measureCode === measureCode &&
                d.age === age &&
                d.status !== 'D'
            );
    
            const currentRate = d3.mean(currentData, d => d.value) || 0;
            const previousRate = d3.mean(previousData, d => d.value) || 0;
            const trend = currentRate - previousRate;
    
            return {
                value: trend,
                direction: trend > 0 ? 'increase' : trend < 0 ? 'decrease' : 'stable',
            };
        };
    
        const latestYear = d3.max(this.data, d => d.year);
    
        // Update trend displays
        ['smokingTrend', 'vapingTrend', 'youthTrend'].forEach(trendId => {
            const measureCode = trendId === 'vapingTrend' ? 'SP_RVPU' : 'SP_DS';
            const age = trendId === 'youthTrend' ? 'From 15 to 24 years' : '15 years or over';
    
            const trend = calculateTrend(this.data, latestYear, measureCode, age);
            const trendElement = d3.select(`#${trendId}`);
    
            const trendHTML = `
                <span class="trend ${trend.direction}">
                    ${Math.abs(trend.value).toFixed(1)}% 
                    ${trend.direction === 'increase' ? '↑' : trend.direction === 'decrease' ? '↓' : '→'}
                </span>`;
    
            trendElement.html(trendHTML);
        });
    }

    // Create main visualization
    createMainVisualization() {
        // Remove loading message
        d3.select('#smokingTrends .loading').remove();
    
        const svg = d3.select('#smokingTrends')
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
            .text('Smoking Rates by Country');
    
        this.updateMainVisualization();
    }
    
    setupEventListeners() {
    const years = [...new Set(this.data.map(d => d.year))].sort();

    // Populate year options
    const yearSelect = d3.select('#yearSelect');
    yearSelect.selectAll('option')
        .data(years)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);

    // Set the initial year to the latest available year
    this.currentYear = years[years.length - 1];
    yearSelect.property('value', this.currentYear);

    // Add event listeners
    yearSelect.on('change', event => {
        this.currentYear = event.target.value;
        this.updateMainVisualization();
    });
}

    // Create mini visualizations
    createMiniVisualizations() {
        this.createGenderComparison();
        this.createAgeDistribution();
        this.createRegionalPatterns();
    }

    createGenderComparison() { /* Implementation */ }
    createAgeDistribution() { /* Implementation */ }
    createRegionalPatterns() { /* Implementation */ }
}

// Initialize visualization
document.addEventListener('DOMContentLoaded', () => {
    const viz = new TobaccoVisualization();
    viz.loadData();
});

export default TobaccoVisualization;
