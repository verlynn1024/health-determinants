// interactive-country-profiles.js
// Sample data for countries
const europeanAverages = {
    smokingRate: 26.0,
    alcoholConsumption: 9.5,
    obesityRate: 21.6,
    fruitConsumption: 104.7
};


// Sample data for countries
const countryData = {
    'FR': {
        name: 'France',
        flag: 'https://flagcdn.com/fr.svg',
        population: 67391582,
        capital: 'Paris',
        smokingRate: 31.9,
        alcoholConsumption: 11.4,
        obesityRate: 21.6,
        fruitConsumption: 113.7,
        trends: [
            { year: 2010, smokingRate: 36.5, alcoholConsumption: 12.2 },
            { year: 2015, smokingRate: 34.1, alcoholConsumption: 11.9 },
            { year: 2020, smokingRate: 31.9, alcoholConsumption: 11.4 }
        ]
    },
    'DE': {
        name: 'Germany',
        flag: 'https://flagcdn.com/de.svg',
        population: 83240525,
        capital: 'Berlin',
        smokingRate: 28.0,
        alcoholConsumption: 10.6,
        obesityRate: 22.3,
        fruitConsumption: 95.2,
        trends: [
            { year: 2010, smokingRate: 32.8, alcoholConsumption: 11.2 },
            { year: 2015, smokingRate: 30.3, alcoholConsumption: 10.9 },
            { year: 2020, smokingRate: 28.0, alcoholConsumption: 10.6 }
        ]
    },
    // Add more countries here
};

// Create a mapping between country names and codes
const countryNameToCode = Object.entries(countryData).reduce((acc, [code, data]) => {
    acc[data.name] = code;
    return acc;
}, {});

document.addEventListener('DOMContentLoaded', function() {
    // Set up the map dimensions
    const width = 960;
    const height = 500;

    // Create the SVG element
    const svg = d3.select("#europe-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create a projection for Europe
    const projection = d3.geoMercator()
        .center([13, 52])
        .scale(500)
        .translate([width / 2, height / 2]);

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Define colors
    const availableColor = "#4CAF50";  // Green for countries with data
    const unavailableColor = "#E0E0E0";  // Light grey for countries without data

    // Load the Europe TopoJSON data
    d3.json("https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/TopoJSON/europe.topojson")
        .then(function(europe) {
            // Convert TopoJSON to GeoJSON
            const europeGeo = topojson.feature(europe, europe.objects.europe);

            // Draw the map
            svg.selectAll("path")
                .data(europeGeo.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", function(d) {
                    const countryName = d.properties.NAME;
                    const countryCode = countryNameToCode[countryName];
                    const hasData = !!countryCode;
                    // Debug: Log country information
                    console.log("Country:", countryName, "Code:", countryCode, "Has data:", hasData);
                    return hasData ? availableColor : unavailableColor;
                })
                .attr("stroke", "#FFFFFF")
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("fill", d3.color(d3.select(this).attr("fill")).darker(0.2));
                })
                .on("mouseout", function(event, d) {
                    const countryName = d.properties.NAME;
                    const countryCode = countryNameToCode[countryName];
                    d3.select(this).attr("fill", countryCode ? availableColor : unavailableColor);
                })
                .on("click", function(event, d) {
                    const countryName = d.properties.NAME;
                    const countryCode = countryNameToCode[countryName];
                    loadCountryData(countryCode);
                });

            // Add legend
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(20, 20)");

            legend.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", availableColor);

            legend.append("text")
                .attr("x", 30)
                .attr("y", 15)
                .text("Data Available");

            legend.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", unavailableColor)
                .attr("transform", "translate(0, 30)");

            legend.append("text")
                .attr("x", 30)
                .attr("y", 45)
                .text("No Data Available");
        })
        .catch(function(error) {
            console.log("Error loading map data:", error);
        });

    // Debug: Log the contents of countryData
    console.log("Available country data:", Object.keys(countryData));
    console.log("Country name to code mapping:", countryNameToCode);
});


function loadCountryData(countryCode) {
    const country = countryData[countryCode];
    if (!country) {
        console.log("No data available for country: " + countryCode);
        
        // Clear previous country data
        document.getElementById('country-flag').src = '';
        document.getElementById('country-name').textContent = 'Data Not Available';
        document.getElementById('country-stats').innerHTML = '';

        // Hide data sections
        document.querySelectorAll('#health-determinants, #trends-section, #country-comparison, #health-insights')
            .forEach(el => el.style.display = 'none');

        // Show error message
        document.getElementById('country-info').style.display = 'block';
        
        // Get list of countries with available data
        const availableCountries = Object.keys(countryData).map(code => countryData[code].name).join(', ');
        
        document.getElementById('country-stats').innerHTML = `
            <p>We're sorry, but we don't have data available for this country yet.</p>
            <p>Please select another country from the map.</p>
            <p>Countries with available data: ${availableCountries}</p>
            <p>We're constantly working to expand our database. Check back later for updates!</p>
        `;

        return;
    }

    // Update country info
    document.getElementById('country-flag').src = country.flag;
    document.getElementById('country-name').textContent = country.name;
    document.getElementById('country-stats').innerHTML = `
        <p>Population: ${country.population.toLocaleString()}</p>
        <p>Capital: ${country.capital}</p>
    `;

    // Show all sections
    document.querySelectorAll('#country-info, #health-determinants, #trends-section, #country-comparison, #health-insights')
        .forEach(el => el.style.display = 'block');

    updateHealthDeterminants(country);
    updateTrendsChart(country);
    updateCountryComparison(country);
    updateDidYouKnow(countryCode);
}

function updateHealthDeterminants(country) {
    updateGaugeChart('smoking-rate', country.smokingRate, 0, 40, 'Smoking Rate (%)');
    updateGaugeChart('alcohol-consumption', country.alcoholConsumption, 0, 15, 'Alcohol Consumption (L/capita)');
}

function updateGaugeChart(elementId, value, min, max, label) {
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    d3.select(`#${elementId} .gauge-chart`).selectAll("*").remove();

    const svg = d3.select(`#${elementId} .gauge-chart`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const scale = d3.scaleLinear()
        .domain([min, max])
        .range([-Math.PI / 2, Math.PI / 2]);

    const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.8)
        .startAngle(-Math.PI / 2);

    svg.append("path")
        .datum({ endAngle: scale(value) })
        .style("fill", "#ff7f0e")
        .attr("d", arc);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(`${value.toFixed(1)}`);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "2em")
        .style("font-size", "12px")
        .text(label);
}

function updateTrendsChart(country) {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select("#trends-chart").selectAll("*").remove();

    const svg = d3.select("#trends-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(country.trends, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(country.trends, d => Math.max(d.smokingRate, d.alcoholConsumption))])
        .range([height, 0]);

    const smokingLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.smokingRate));

    const alcoholLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.alcoholConsumption));

    svg.append("path")
        .datum(country.trends)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", smokingLine);

    svg.append("path")
        .datum(country.trends)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", alcoholLine);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Health Trends Over Time");
}

function updateCountryComparison(country) {
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select("#radar-chart").selectAll("*").remove();

    const svg = d3.select("#radar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    const features = ["smokingRate", "alcoholConsumption", "obesityRate", "fruitConsumption"];

    const radialScale = d3.scaleLinear()
        .domain([0, d3.max(features, feature => Math.max(country[feature], europeanAverages[feature]))])
        .range([0, width / 2]);

    const angleScale = d3.scaleOrdinal()
        .domain(features)
        .range([0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]);

    features.forEach(feature => {
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", d => radialScale(d3.max(features, f => Math.max(country[f], europeanAverages[f]))) * Math.cos(angleScale(feature) - Math.PI / 2))
            .attr("y2", d => radialScale(d3.max(features, f => Math.max(country[f], europeanAverages[f]))) * Math.sin(angleScale(feature) - Math.PI / 2))
            .attr("stroke", "gray");

        svg.append("text")
            .attr("x", d => radialScale(d3.max(features, f => Math.max(country[f], europeanAverages[f])) * 1.1) * Math.cos(angleScale(feature) - Math.PI / 2))
            .attr("y", d => radialScale(d3.max(features, f => Math.max(country[f], europeanAverages[f])) * 1.1) * Math.sin(angleScale(feature) - Math.PI / 2))
            .attr("text-anchor", "middle")
            .text(feature);
    });

    const countryDataPoints = features.map(feature => ({
        feature: feature,
        value: country[feature],
        x: radialScale(country[feature]) * Math.cos(angleScale(feature) - Math.PI / 2),
        y: radialScale(country[feature]) * Math.sin(angleScale(feature) - Math.PI / 2)
    }));

    const europeDataPoints = features.map(feature => ({
        feature: feature,
        value: europeanAverages[feature],
        x: radialScale(europeanAverages[feature]) * Math.cos(angleScale(feature) - Math.PI / 2),
        y: radialScale(europeanAverages[feature]) * Math.sin(angleScale(feature) - Math.PI / 2)
    }));

    const countryLine = d3.lineRadial()
        .angle(d => angleScale(d.feature))
        .radius(d => radialScale(d.value))
        .curve(d3.curveLinearClosed);

    svg.append("path")
        .datum(countryDataPoints)
        .attr("d", countryLine)
        .attr("stroke", "blue")
        .attr("fill", "blue")
        .attr("fill-opacity", 0.1);

    svg.append("path")
        .datum(europeDataPoints)
        .attr("d", countryLine)
        .attr("stroke", "red")
        .attr("fill", "red")
        .attr("fill-opacity", 0.1);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Country vs European Average");
}

function updateDidYouKnow(countryCode) {
    const facts = {
        'FR': 'France has one of the highest life expectancies in Europe.',
        'DE': 'Germany has a universal multi-payer health care system.',
        // Add more facts for other countries
    };
    document.getElementById('fun-fact').textContent = facts[countryCode] || 'No fact available for this country.';
}