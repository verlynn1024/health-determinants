// data-loader.js - Data loading and processing

import * as d3 from 'd3';

export async function loadData() {
  try {
    const [mainData, countryMetadata, europeanAverages, regionalAggregates] = await Promise.all([
      d3.json('/data/main-health-determinants.json'),
      d3.json('/data/country-metadata.json'),
      d3.json('/data/european-averages.json'),
      d3.json('/data/regional-aggregates.json')
    ]);

    return {
      mainData: processMainData(mainData),
      countryMetadata,
      europeanAverages,
      regionalAggregates
    };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

function processMainData(data) {
  return data.map(d => ({
    ...d,
    Year: +d.Year,
    Value: +d.Value
  }));
}