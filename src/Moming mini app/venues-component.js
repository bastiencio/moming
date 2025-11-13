// Venues component for the mini app that fetches data from Supabase
// This component integrates with your existing mini app structure

// Supabase client configuration (matching your existing setup)
const { createClient } = window.supabase;

// Initialize Supabase client with your project credentials
const supabase = createClient(
  "https://ubnijvfhtmlrnbhoggba.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibmlqdmZodG1scm5iaG9nZ2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTUwMDcsImV4cCI6MjA3NDk5MTAwN30.aCR2IIA8PdvG6tcwszRN8H60UoF0zKWN6jrTy_qbyfE"
);

class VenuesComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.venues = [];
    this.language = 'en'; // Default to English
    this.loading = false;
    this.error = null;
    
    if (this.container) {
      this.init();
    }
  }

  async init() {
    await this.fetchVenues();
    this.render();
  }

  async fetchVenues() {
    try {
      this.loading = true;
      this.error = null; // Clear any previous errors
      this.render(); // Show loading state
      
      console.log('Fetching venues from Supabase...');
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('active', true)
        .order('city', { ascending: true });

      if (error) {
        console.error('Error fetching venues:', error);
        throw error;
      }
      
      console.log('Successfully fetched venues:', data);
      this.venues = data || [];
    } catch (error) {
      console.error('Error fetching venues:', error);
      // Display error in UI
      this.error = error.message;
    } finally {
      this.loading = false;
      this.render();
    }
  }

  toggleLanguage() {
    this.language = this.language === 'en' ? 'zh' : 'en';
    this.render();
  }

  getVenueName(venue) {
    if (this.language === 'zh' && venue.name_zh) {
      return venue.name_zh;
    }
    return venue.name_en;
  }

  render() {
    if (!this.container) return;

    if (this.loading) {
      this.container.innerHTML = `
        <div class="venues-loading">
          <p>${this.language === 'en' ? 'Loading venues...' : '加载场所...'}</p>
        </div>
      `;
      return;
    }
    
    if (this.error) {
      this.container.innerHTML = `
        <div class="venues-error">
          <h2>Error Loading Venues</h2>
          <p>${this.error}</p>
          <button onclick="window.venuesComponent.fetchVenues()">Retry</button>
        </div>
      `;
      return;
    }

    // Group venues by city
    const venuesByCity = {};
    this.venues.forEach(venue => {
      const city = venue.city;
      if (!venuesByCity[city]) {
        venuesByCity[city] = [];
      }
      venuesByCity[city].push(venue);
    });

    const cities = Object.keys(venuesByCity).sort();

    // Try to get localized titles from the existing data structure
    const locationsData = window.MoMingData?.CONSTANTS?.I18N?.locations || {};
    const title = this.language === 'en' 
      ? (locationsData.title?.en || 'Where to Find MoMing') 
      : (locationsData.title?.zh || '在哪里找到 MoMing');
    const description = this.language === 'en' 
      ? (locationsData.description?.en || 'Find our kombucha at these fine establishments across China.') 
      : (locationsData.description?.zh || '在中国的这些优质场所找到我们的康普茶。');
    const venuesInText = this.language === 'en' 
      ? (locationsData.venuesIn?.en || 'Venues in') 
      : (locationsData.venuesIn?.zh || '位于');
    
    this.container.innerHTML = `
      <div class="venues-component">
        <div class="venues-header">
          <div>
            <h2>${title}</h2>
            <p class="venues-description">${description}</p>
          </div>
          <button class="language-toggle" onclick="venuesComponent.toggleLanguage()">
            ${this.language === 'en' ? '中文' : 'English'}
          </button>
        </div>
        
        <div class="venues-content">
          ${cities.map(city => `
            <div class="city-section">
              <h3>${venuesInText} ${city}</h3>
              <div class="venues-grid">
                ${venuesByCity[city].map(venue => `
                  <div class="venue-card">
                    <div class="venue-info">
                      <h4>${this.getVenueName(venue)}</h4>
                      ${venue.location ? `<p class="venue-location">${venue.location}</p>` : ''}
                      ${venue.description_en || venue.description_zh ? `
                        <p class="venue-description">
                          ${this.language === 'zh' && venue.description_zh ? venue.description_zh : venue.description_en}
                        </p>
                      ` : ''}
                    </div>
                    ${venue.picture_url ? `
                      <div class="venue-image">
                        <img src="${venue.picture_url}" alt="${this.getVenueName(venue)}" />
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          
          ${cities.length === 0 ? `
            <div class="no-venues">
              <p>${this.language === 'en' ? 'No venues found' : '未找到场所'}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add basic styles
    this.addStyles();
  }

  addStyles() {
    const styleId = 'venues-component-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .venues-component {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .venues-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .venues-header h2 {
        font-size: 2.5rem;
        font-weight: 700;
        color: #2c3e50;
        font-family: 'Playfair Display', serif;
        margin: 0;
      }
      
      .venues-description {
        font-size: 1.2rem;
        color: #7f8c8d;
        margin: 8px 0 0 0;
        max-width: 600px;
      }
      
      .language-toggle {
        padding: 0.5rem 1.5rem;
        background-color: #3498db;
        border: none;
        border-radius: 9999px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        color: white;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);
      }
      
      .language-toggle:hover {
        background-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(52, 152, 219, 0.3);
      }
      
      .city-section {
        margin-bottom: 40px;
      }
      
      .city-section h3 {
        font-size: 1.875rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 24px;
        padding-bottom: 12px;
        border-bottom: 2px solid #ecf0f1;
      }
      
      .venues-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .venue-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .venue-card:hover {
        transform: translateY(-0.25rem);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      
      .venue-info {
        flex: 1;
      }
      
      .venue-info h4 {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
      }
      
      .venue-location {
        font-size: 1rem;
        color: #7f8c8d;
        margin: 0 0 0.5rem 0;
      }
      
      .venue-description {
        font-size: 1rem;
        color: #7f8c8d;
        line-height: 1.625;
      }
      
      .venue-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
      }
      
      .venue-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .no-venues {
        text-align: center;
        padding: 40px;
        color: #999;
      }
      
      .venues-loading {
        text-align: center;
        padding: 40px;
        color: #666;
      }
      
      .venues-error {
        text-align: center;
        padding: 40px;
        color: #e74c3c;
        background-color: #fdf2f2;
        border: 1px solid #f5c6cb;
        border-radius: 0.5rem;
        margin: 2rem;
      }
      
      .venues-error button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
        margin-top: 1rem;
      }
      
      .venues-error button:hover {
        background-color: #2980b9;
      }
      
      @media (max-width: 768px) {
        .venues-grid {
          grid-template-columns: 1fr;
        }
        
        .venues-header {
          flex-direction: column;
          gap: 15px;
          align-items: flex-start;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Initialize the component when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Make the component globally accessible so the toggle button can call it
  window.venuesComponent = new VenuesComponent('venues-container');
  
  // Try to initialize venues once the React app data is loaded
  initVenues();
});

// Function to show venues (call this when navigating to "Where to Find MoMing" page)
function showVenues() {
  const container = document.getElementById('venues-container');
  if (container) {
    container.style.display = 'block';
    // Refresh venues data
    if (window.venuesComponent) {
      // Clear any previous errors
      window.venuesComponent.error = null;
      window.venuesComponent.fetchVenues();
    }
  }
}

// Function to hide venues (call this when navigating away from venues page)
function hideVenues() {
  const container = document.getElementById('venues-container');
  if (container) {
    container.style.display = 'none';
  }
}

// Function to initialize venues when the React app is ready
function initVenues() {
  // Try to get the localized data from the React app
  if (typeof window.MoMingData !== 'undefined') {
    // Data is already available
    if (window.venuesComponent) {
      window.venuesComponent.render();
    }
  } else {
    // Wait for the React app to load the data
    const checkData = setInterval(() => {
      if (typeof window.MoMingData !== 'undefined') {
        clearInterval(checkData);
        if (window.venuesComponent) {
          window.venuesComponent.render();
        }
      }
    }, 100);
    
    // Stop checking after 5 seconds
    setTimeout(() => {
      clearInterval(checkData);
    }, 5000);
  }
}