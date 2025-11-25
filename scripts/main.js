// main.js
import { loadData } from './data.js';
import { renderBooks, showNotification } from './ui.js';
import { setupEventListeners } from './events.js';
import { updateDashboardStats } from './stats.js';
import { setupAuth } from './auth.js';

export function refreshUI() {
  renderBooks();
  updateDashboardStats();
}

window.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupAuth();
  setupEventListeners();
  refreshUI();
  showNotification(`📚 Mike's Library loaded successfully!`);
});
