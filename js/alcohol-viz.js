// alcohol-viz.js
class AlcoholVisualization {
    constructor() {
        this.margin = { top: 40, right: 30, bottom: 60, left: 60 };
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.currentYear = '2020';
        
        // Hardcoded alcohol consumption data
        this.data = [
            { country: "FRA", year: "2020", value: 11.4, region: "Europe" },
            { country: "DEU", year: "2020", value: 10.6, region: "Europe" },
            { country: "GBR", year: "2020", value: 9.7, region: "Europe" },
            { country: "USA", year: "2020", value: 8.9, region: "Americas" },
            { country: "CAN", year: "2020", value: 8.0, region: "Americas" },
            { country: "JPN", year: "2020", value: 7.1, region: "Asia" },
            { country: "AUS", year: "2020", value: 9.5, region: "Oceania" },
            { country: "NZL", year: "2020", value: 8.8, region: "Oceania" },
            // Historical data
            { country: "FRA", year: "2015", value: 12.0, region: "Europe" },
            { country: "DEU", year: "2015", value: 11.0, region: "Europe" },
            { country: "GBR", year: "2015", value: 9.8, region: "Europe" },
            { country: "USA", year: "2015", value: 8.8, region: "Americas" },
            { country: "CAN", year: "2015", value: 8.2, region: "Americas" },
            { country: "JPN", year: "2015", value: 7.4, region: "Asia" },
            { country: "AUS", year: "2015", value: 9.7, region: "Oceania" },
            { country: "NZL", year: "2015", value: 9.1, region: "Oceania" },
            // 2010 data
            { country: "FRA", year: "2010", value: 12.5, region: "Europe" },
            { country: "DEU", year: "2010", value: 11.2, region: "Europe" },
            { country: "GBR", year: "2010", value: 10.2, region: "Europe" },
            { country: "USA", year: "2010", value: 9.0, region: "Americas" },
            { country: "CAN", year: "2010", value: 8.4, region: "Americas" },
            { country: "JPN", year: "2010", value: 7.3, region: "Asia" },
            { country: "AUS", year: "2010", value: 10.1, region: "Oceania" },
            { country: "NZL", year: "2010", value: 9.6, region: "Oceania" }
        ];

        // Color scale for regions
        this.colorScale = d3.scaleOrdinal()
            .domain(["Europe", "Americas", "Asia", "Oceania"])
            .range(["#2ecc71", "#3498db", "#e74c3c", "#f1c40f"]);
    }

    initialize() {
        this.createMainVisualization();
        this.createTrendsVisualization();
        this.updateOverviewStats();
        this.setupEventListeners();
    }

    createMainVisualization() {
        const container = d3.select('#consumptionTrends');
        container.select('svg').remove();
        container.select('.loading').remove();

        const svg = container.append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Filter data for current year
        const currentData = this.data.filter(d => d.year === this.currentYear)
            .sort((a, b) => b.value - a.value);

        // Create scales
        const x = d3.scaleBand()
            .range([0, this.width])
            .domain(currentData.map(d => d.country))
            .padding(0.2);

        const y = d3.scaleLinear()
            .range([this.height, 0])
            .domain([0, d3.max(currentData, d => d.value) * 1.1]);

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        svg.append('g')
            .call(d3.axisLeft(y).ticks(10));

        // Add bars with animation
        const bars = svg.selectAll('rect')
            .data(currentData)
            .enter()
            .append('rect')
            .attr('x', d => x(d.country))
            .attr('width', x.bandwidth())
            .attr('y', this.height)  // Start from bottom
            .attr('height', 0)       // Initial height of 0
            .attr('fill', d => this.colorScale(d.region))
            .attr('rx', 4)           // Rounded corners
            .attr('ry', 4);

        // Animate bars
        bars.transition()
            .duration(1000)
            .delay((d, i) => i * 100)
            .attr('y', d => y(d.value))
            .attr('height', d => this.height - y(d.value));

        // Add tooltips
        const tooltip = container
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #ddd')
            .style('padding', '10px')
            .style('border-radius', '5px');

        bars.on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`
                <strong>${d.country}</strong><br/>
                Region: ${d.region}<br/>
                Consumption: ${d.value} L/person<br/>
                Year: ${d.year}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');

            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr('opacity', 0.7);
        })
        .on('mouseout', (event) => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
            
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr('opacity', 1);
        });

        // Add labels
        svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .text(`Alcohol Consumption by Country (${this.currentYear})`);

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Liters per Person');
    }

    createTrendsVisualization() {
        const container = d3.select('#timeTrends');
        const margin = { top: 20, right: 80, bottom: 30, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        const x = d3.scalePoint()
            .domain(['2010', '2015', '2020'])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.value) * 1.1])
            .range([height, 0]);

        // Create line generator
        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        // Add lines for each country with animation
        const countries = [...new Set(this.data.map(d => d.country))];
        
        countries.forEach(country => {
            const countryData = this.data
                .filter(d => d.country === country)
                .sort((a, b) => a.year.localeCompare(b.year));

            const path = svg.append('path')
                .datum(countryData)
                .attr('class', 'line')
                .attr('fill', 'none')
                .attr('stroke', d => this.colorScale(d[0].region))
                .attr('stroke-width', 2)
                .attr('d', line);

            // Animate line drawing
            const pathLength = path.node().getTotalLength();
            
            path.attr('stroke-dasharray', pathLength + ' ' + pathLength)
                .attr('stroke-dashoffset', pathLength)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);

            // Add country labels at the end of each line
            svg.append('text')
                .datum(countryData[countryData.length - 1])
                .attr('x', d => x(d.year) + 10)
                .attr('y', d => y(d.value))
                .attr('dy', '0.35em')
                .style('font-size', '12px')
                .text(country)
                .style('opacity', 0)
                .transition()
                .duration(1000)
                .style('opacity', 1);
        });

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));

        // Add labels
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Alcohol Consumption Trends Over Time');
    }

    updateOverviewStats() {
        const currentData = this.data.filter(d => d.year === this.currentYear);
        const avgConsumption = d3.mean(currentData, d => d.value).toFixed(1);
        const maxConsumption = d3.max(currentData, d => d.value).toFixed(1);
        const minConsumption = d3.min(currentData, d => d.value).toFixed(1);

        // You would typically update DOM elements here with these statistics
        console.log(`Average Consumption: ${avgConsumption}L`);
        console.log(`Highest Consumption: ${maxConsumption}L`);
        console.log(`Lowest Consumption: ${minConsumption}L`);
    }

    setupEventListeners() {
        // Add year selector if needed
        const yearSelect = document.createElement('select');
        yearSelect.id = 'yearSelect';
        ['2020', '2015', '2010'].forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelect.appendChild(option);
        });

        const controls = document.querySelector('.controls');
        if (controls) {
            controls.prepend(yearSelect);
            yearSelect.addEventListener('change', (event) => {
                this.currentYear = event.target.value;
                this.createMainVisualization();
                this.updateOverviewStats();
            });
        }
    }
}

// Initialize visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const viz = new AlcoholVisualization();
    viz.initialize();
});