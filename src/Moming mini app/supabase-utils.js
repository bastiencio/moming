// Utility functions for Supabase integration in your mini app
// This provides a simple interface to fetch data from your Supabase database

// Supabase client configuration
const { createClient } = window.supabase;

// Initialize Supabase client with your project credentials
const supabase = createClient(
  "https://ubnijvfhtmlrnbhoggba.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibmlqdmZodG1scm5iaG9nZ2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTUwMDcsImV4cCI6MjA3NDk5MTAwN30.aCR2IIA8PdvG6tcwszRN8H60UoF0zKWN6jrTy_qbyfE"
);

/**
 * Fetch venues from the database
 * @param {Object} options - Query options
 * @param {boolean} options.activeOnly - Only fetch active venues (default: true)
 * @param {string} options.country - Filter by country
 * @param {string} options.city - Filter by city
 * @returns {Promise<Array>} Array of venue objects
 */
async function fetchVenues(options = {}) {
  const {
    activeOnly = true,
    country = null,
    city = null
  } = options;

  let query = supabase
    .from('venues')
    .select('*')
    .order('city', { ascending: true })
    .order('name_en', { ascending: true });

  // Apply filters
  if (activeOnly) {
    query = query.eq('active', true);
  }

  if (country) {
    query = query.eq('country', country);
  }

  if (city) {
    query = query.eq('city', city);
  }

  try {
    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
}

/**
 * Fetch a single venue by ID
 * @param {string} id - Venue ID
 * @returns {Promise<Object>} Venue object
 */
async function fetchVenueById(id) {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching venue:', error);
    throw error;
  }
}

/**
 * Search venues by name or location
 * @param {string} searchTerm - Text to search for
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matching venue objects
 */
async function searchVenues(searchTerm, options = {}) {
  const { activeOnly = true } = options;

  let query = supabase
    .from('venues')
    .select('*')
    .order('city', { ascending: true });

  if (activeOnly) {
    query = query.eq('active', true);
  }

  // Search in both English and Chinese names
  if (searchTerm) {
    query = query.or(`name_en.ilike.%${searchTerm}%,name_zh.ilike.%${searchTerm}%`);
  }

  try {
    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching venues:', error);
    throw error;
  }
}

/**
 * Get unique cities with active venues
 * @returns {Promise<Array>} Array of city names
 */
async function getVenueCities() {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('city')
      .eq('active', true)
      .order('city', { ascending: true });

    if (error) throw error;
    
    // Extract unique cities
    const cities = [...new Set(data.map(venue => venue.city))];
    return cities;
  } catch (error) {
    console.error('Error fetching venue cities:', error);
    throw error;
  }
}

/**
 * Get unique countries with active venues
 * @returns {Promise<Array>} Array of country names
 */
async function getVenueCountries() {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('country')
      .eq('active', true)
      .order('country', { ascending: true });

    if (error) throw error;
    
    // Extract unique countries
    const countries = [...new Set(data.map(venue => venue.country))];
    return countries;
  } catch (error) {
    console.error('Error fetching venue countries:', error);
    throw error;
  }
}

// Export functions for use in your mini app
window.MoMingAPI = {
  venues: {
    fetchAll: fetchVenues,
    fetchById: fetchVenueById,
    search: searchVenues,
    getCities: getVenueCities,
    getCountries: getVenueCountries
  },
  // Add other data access functions here as needed
};

// Example usage:
// const venues = await MoMingAPI.venues.fetchAll({ country: 'China' });
// const venue = await MoMingAPI.venues.fetchById('some-uuid');
// const results = await MoMingAPI.venues.search('Beijing');