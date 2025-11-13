import { CONFIG } from '../config.js';
import { SupabaseService } from './supabase.js';
import { UI } from './ui.js';

class MiniApp {
  constructor() {
    this.currentLanguage = CONFIG.APP.DEFAULT_LANGUAGE;
    this.venues = [];
    this.supabaseService = new SupabaseService();
    this.ui = new UI();
    
    this.init();
  }
  
  async init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Load venues
    await this.loadVenues();
  }
  
  setupEventListeners() {
    // Language toggle buttons
    document.getElementById('en-btn').addEventListener('click', () => this.switchLanguage('en'));
    document.getElementById('zh-btn').addEventListener('click', () => this.switchLanguage('zh'));
    
    // Retry button
    document.getElementById('retry-btn').addEventListener('click', () => this.loadVenues());
  }
  
  async loadVenues() {
    try {
      this.ui.showLoading();
      
      const venues = await this.supabaseService.getVenues();
      this.venues = venues;
      
      this.ui.hideLoading();
      this.ui.renderVenues(venues, this.currentLanguage);
    } catch (error) {
      console.error('Error loading venues:', error);
      this.ui.showError();
    }
  }
  
  switchLanguage(language) {
    this.currentLanguage = language;
    this.ui.updateLanguageButtons(language);
    this.ui.updateTexts(language);
    this.ui.renderVenues(this.venues, language);
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MiniApp();
});

export default MiniApp;