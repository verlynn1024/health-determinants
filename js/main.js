// main.js - Main application logic

import { loadData } from './data-loader.js';
import { createDashboard } from './visualizations.js';
import { setupInteractivity } from './interactivity.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await loadData();
    const dashboard = createDashboard(data);
    setupInteractivity(dashboard);
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});