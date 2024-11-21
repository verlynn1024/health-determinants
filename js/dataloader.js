// dataloader.js

class DataLoader {
    constructor() {
        this.cachedData = new Map();
    }

    /**
     * Generic CSV file loader with caching
     * @param {string} filename - Name of the CSV file to load
     * @returns {Promise<Array>} - Parsed data
     */
    async loadCSV(filename) {
        if (this.cachedData.has(filename)) {
            return this.cachedData.get(filename);
        }

        try {
            // Use relative path to data directory
            const response = await fetch(`../data/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            const data = d3.csvParse(csvText);
            this.cachedData.set(filename, data);
            return data;
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            throw error;
        }
    }

    /**
     * Load tobacco consumption data
     * @returns {Promise<Array>} - Processed tobacco data
     */
    async loadTobaccoData() {
        const data = await this.loadCSV('tobacco_consumption.csv');
        return data
            .filter(d => d.MEASURE === 'SP_DS') // Daily smokers
            .map(row => ({
                country: row.REF_AREA,
                year: +row.TIME_PERIOD,
                value: +row.OBS_VALUE,
                sex: row.SEX,
                age: row.AGE,
                methodology: row.METHODOLOGY
            }));
    }

    /**
     * Load alcohol consumption data
     * @returns {Promise<Array>} - Processed alcohol data
     */
    async loadAlcoholData() {
        const data = await this.loadCSV('alcohol_consumption.csv');
        return data
            .filter(d => d.MEASURE === 'AC') // Alcohol consumption
            .map(row => ({
                country: row.REF_AREA,
                year: +row.TIME_PERIOD,
                value: +row.OBS_VALUE,
                sex: row.SEX,
                age: row.AGE,
                methodology: row.METHODOLOGY,
                unit: row.UNIT_MEASURE
            }));
    }

    /**
     * Load nutrition data
     * @returns {Promise<Array>} - Processed nutrition data
     */
    async loadNutritionData() {
        const data = await this.loadCSV('nutrition_data.csv');
        return data
            .filter(d => d.MEASURE === 'SP_CFRD') // Daily fruit consumption
            .map(row => ({
                country: row.REF_AREA,
                year: +row.TIME_PERIOD,
                value: +row.OBS_VALUE,
                sex: row.SEX,
                age: row.AGE,
                methodology: row.METHODOLOGY,
                status: row.OBS_STATUS // For tracking data quality
            }));
    }

    /**
     * Load obesity and overweight data
     * @returns {Promise<Object>} - Processed weight data with separate obesity and overweight arrays
     */
    async loadWeightData() {
        const data = await this.loadCSV('obesity_overweight.csv');
        
        return {
            overweight: this.processWeightData(data, 'SP_OVRGHT'),
            obesity: this.processWeightData(data, 'SP_OBESE')
        };
    }

    /**
     * Process weight data for a specific measure
     * @param {Array} data - Raw data array
     * @param {string} measure - Measure type to filter
     * @returns {Array} - Processed data array
     */
    processWeightData(data, measure) {
        return data
            .filter(row => row.MEASURE === measure)
            .map(row => ({
                country: row.REF_AREA,
                year: +row.TIME_PERIOD,
                value: +row.OBS_VALUE,
                sex: row.SEX,
                age: row.AGE,
                methodology: row.METHODOLOGY
            }));
    }

    /**
     * Get aggregated health metrics for dashboard
     * @returns {Promise<Object>} - Latest health metrics
     */
    async getHealthMetrics() {
        try {
            const [tobacco, alcohol, nutrition, weightData] = await Promise.all([
                this.loadTobaccoData(),
                this.loadAlcoholData(),
                this.loadNutritionData(),
                this.loadWeightData()
            ]);

            const latestYears = {
                tobacco: d3.max(tobacco, d => d.year),
                alcohol: d3.max(alcohol, d => d.year),
                nutrition: d3.max(nutrition, d => d.year),
                weight: d3.max(weightData.overweight, d => d.year)
            };

            return {
                smokingRate: {
                    value: this.calculateAverage(tobacco.filter(d => d.year === latestYears.tobacco)),
                    year: latestYears.tobacco,
                    trend: this.calculateTrend(tobacco)
                },
                alcoholConsumption: {
                    value: this.calculateAverage(alcohol.filter(d => d.year === latestYears.alcohol)),
                    year: latestYears.alcohol,
                    trend: this.calculateTrend(alcohol)
                },
                fruitConsumption: {
                    value: this.calculateAverage(nutrition.filter(d => d.year === latestYears.nutrition)),
                    year: latestYears.nutrition,
                    trend: this.calculateTrend(nutrition)
                },
                overweightRate: {
                    value: this.calculateAverage(weightData.overweight.filter(d => d.year === latestYears.weight)),
                    year: latestYears.weight,
                    trend: this.calculateTrend(weightData.overweight)
                }
            };
        } catch (error) {
            console.error('Error getting health metrics:', error);
            throw error;
        }
    }

    /**
     * Calculate average value from array of data points
     * @param {Array} data - Array of data points
     * @returns {number} - Average value
     */
    calculateAverage(data) {
        return d3.mean(data, d => d.value) || 0;
    }

    /**
     * Calculate trend (percentage change) between earliest and latest year
     * @param {Array} data - Array of data points
     * @returns {number} - Trend percentage
     */
    calculateTrend(data) {
        if (!data.length) return 0;
        
        const yearExtent = d3.extent(data, d => d.year);
        const earliestYear = yearExtent[0];
        const latestYear = yearExtent[1];
        
        const earliestValue = d3.mean(data.filter(d => d.year === earliestYear), d => d.value) || 0;
        const latestValue = d3.mean(data.filter(d => d.year === latestYear), d => d.value) || 0;
        
        return earliestValue ? ((latestValue - earliestValue) / earliestValue) * 100 : 0;
    }

    /**
     * Get time series data for a specific country
     * @param {Array} data - Full dataset
     * @param {string} country - Country code
     * @returns {Array} - Filtered data for the country
     */
    getCountryTimeSeries(data, country) {
        return data
            .filter(d => d.country === country)
            .sort((a, b) => d3.ascending(a.year, b.year));
    }

    /**
     * Get latest year data for all countries
     * @param {Array} data - Full dataset
     * @returns {Array} - Latest year data for each country
     */
    getLatestYearData(data) {
        const latestYear = d3.max(data, d => d.year);
        return data
            .filter(d => d.year === latestYear)
            .sort((a, b) => d3.descending(a.value, b.value));
    }
}

// Create and export singleton instance
const dataLoader = new DataLoader();
export default dataLoader;