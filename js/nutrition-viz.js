// nutrition-viz.js

async function initializeNutritionViz() {
    try {
        /*** Fruit Consumption Visualization ***/

        // Hardcoded fruit consumption data 
        const fruitData = [
          { country: "AUS", year: 2001, value: 94, methodology: "Survey" },
          { country: "AUS", year: 2022, value: 87.9, methodology: "Survey" },
          { country: "USA", year: 2021, value: 72.6, methodology: "Survey" },
          { country: "CAN", year: 2004, value: 84.8, methodology: "Survey" },
          { country: "GBR", year: 2021, value: 81.2, methodology: "Survey" }
        ];

        // Set up dimensions for fruit consumption visualization  
        const fruitMargin = { top: 40, right: 20, bottom: 100, left: 60 };
        const fruitWidth = 500 - fruitMargin.left - fruitMargin.right; 
        const fruitHeight = 400 - fruitMargin.top - fruitMargin.bottom;

        // Create SVG container for fruit consumption
        const fruitSvg = d3.select('#fruitVegTrends')
          .append('svg')
            .attr('width', fruitWidth + fruitMargin.left + fruitMargin.right)
            .attr('height', fruitHeight + fruitMargin.top + fruitMargin.bottom)
          .append('g')
            .attr('transform', `translate(${fruitMargin.left},${fruitMargin.top})`);

        // Create scales for fruit consumption
        const fruitXScale = d3.scaleBand()
          .domain(fruitData.map(d => d.country))  
          .range([0, fruitWidth])
          .padding(0.2);

        const fruitYScale = d3.scaleLinear()
          .domain([0, 100])  
          .range([fruitHeight, 0]);

        // Create and add axes for fruit consumption
        const fruitXAxis = d3.axisBottom(fruitXScale);
        const fruitYAxis = d3.axisLeft(fruitYScale).ticks(10);  

        fruitSvg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${fruitHeight})`)
            .call(fruitXAxis)
          .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')  
            .attr('transform', 'rotate(-45)');

        fruitSvg.append('g')
            .attr('class', 'y-axis')  
            .call(fruitYAxis);

        // Create bars for fruit consumption
        fruitSvg.selectAll('rect')
          .data(fruitData)
          .enter()
          .append('rect') 
            .attr('x', d => fruitXScale(d.country))
            .attr('y', d => fruitYScale(d.value))
            .attr('width', fruitXScale.bandwidth())
            .attr('height', d => fruitHeight - fruitYScale(d.value))
            .attr('fill', '#2ecc71');

        // Add axis labels and title for fruit consumption
        fruitSvg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', 0 - (fruitHeight / 2))
            .attr('y', 0 - fruitMargin.left)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Percentage of Population (%)');  

        fruitSvg.append('text')
            .attr('x', fruitWidth / 2)
            .attr('y', 0 - (fruitMargin.top / 2))
            .attr('text-anchor', 'middle') 
            .style('font-size', '16px')
            .text('Daily Fruit Consumption by Country');

        /*** Nutritional Supply Trends Visualization ***/

        // Hardcoded nutritional supply data
        const nutritionData = [
          { year: 2010, calories: 3200, protein: 105, fat: 130, sugar: 110 },
          { year: 2015, calories: 3100, protein: 102, fat: 125, sugar: 105 }, 
          { year: 2020, calories: 3000, protein: 100, fat: 120, sugar: 100 }
        ];

        // Set up dimensions for nutritional supply trends 
        const nutriMargin = { top: 20, right: 80, bottom: 60, left: 50 };
        const nutriWidth = 600 - nutriMargin.left - nutriMargin.right;
        const nutriHeight = 400 - nutriMargin.top - nutriMargin.bottom;

        // Create SVG container for nutritional supply
        const nutriSvg = d3.select('#nutritionTrends')
          .append('svg')
            .attr('width', nutriWidth + nutriMargin.left + nutriMargin.right)  
            .attr('height', nutriHeight + nutriMargin.top + nutriMargin.bottom)
          .append('g')
            .attr('transform', `translate(${nutriMargin.left},${nutriMargin.top})`);

        // Create scales for nutritional supply  
        const nutriXScale = d3.scalePoint()
          .domain(nutritionData.map(d => d.year))
          .range([0, nutriWidth]);

        const nutriYScale = d3.scaleLinear()
          .domain([0, 4000])
          .range([nutriHeight, 0]);

        // Create line generator
        const line = d3.line()
          .x(d => nutriXScale(d.year))    
          .y(d => nutriYScale(d.calories));
        
        // Add lines for each nutrition metric
        const metrics = ['calories', 'protein', 'fat', 'sugar'];
        const colors = ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c'];

        metrics.forEach((metric, i) => {
          nutriSvg.append('path')
            .datum(nutritionData)
            .attr('class', 'line')
            .attr('d', line.y(d => nutriYScale(d[metric])))
            .attr('fill', 'none')
            .attr('stroke', colors[i])
            .attr('stroke-width', 2);
        });

        // Create and add axes for nutritional supply   
        const nutriXAxis = d3.axisBottom(nutriXScale);
        const nutriYAxis = d3.axisLeft(nutriYScale);

        nutriSvg.append('g')  
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${nutriHeight})`)
            .call(nutriXAxis);
        
        nutriSvg.append('g')
            .attr('class', 'y-axis')
            .call(nutriYAxis);

        // Add axis labels
        nutriSvg.append('text')             
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - nutriMargin.left)
            .attr('x', 0 - (nutriHeight / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Supply per Capita'); 

        nutriSvg.append('text')
            .attr('x', nutriWidth / 2)
            .attr('y', nutriHeight + nutriMargin.bottom - 5)  
            .attr('text-anchor', 'middle')
            .text('Year');

        // Add legend    
        const legend = nutriSvg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${nutriWidth - 60}, 20)`);

        metrics.forEach((metric, i) => {
          const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);

          legendRow.append('rect')  
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', colors[i]);

          legendRow.append('text') 
            .attr('x', 20)  
            .attr('y', 10)
            .text(metric);  
        });

        // Update metric cards
        updateMetricCards();

    } catch (error) {
        console.error('Error loading or processing data:', error);
        d3.select('#fruitVegTrends')
            .append('p')
            .attr('class', 'error-message')
            .text('Error loading fruit consumption visualization.');
        d3.select('#nutritionTrends')
            .append('p') 
            .attr('class', 'error-message')
            .text('Error loading nutritional supply trends.');
    }
}

// Function to update metric cards with latest data
function updateMetricCards() {
    // Hardcoded latest metric data  
    const latestFruitConsumption = 87.9; 
    const latestVegetableSupply = 320;
    const latestProteinSupply = 100;
    const latestSugarSupply = 100;

    d3.select('#fruitMetric').text(`${latestFruitConsumption}%`);
    d3.select('#vegMetric').text(`${latestVegetableSupply}g`); 
    d3.select('#proteinMetric').text(`${latestProteinSupply}g`);
    d3.select('#sugarMetric').text(`${latestSugarSupply}g`);
}

// Initialize visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNutritionViz);