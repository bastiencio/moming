import { CONFIG } from '../config.js';

export class SupabaseService {
  constructor() {
    this.initSupabase();
  }
  
  initSupabase() {
    // Dynamically import Supabase client
    import('https://cdn.skypack.dev/@supabase/supabase-js')
      .then(({ createClient }) => {
        this.supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
      })
      .catch(error => {
        console.error('Failed to initialize Supabase client:', error);
      });
  }
  
  async getVenues() {
    // Wait for Supabase to be initialized
    while (!this.supabase) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      let query = this.supabase
        .from(CONFIG.API.VENUES_TABLE)
        .select('*');
      
      if (CONFIG.API.ACTIVE_VENUES_ONLY) {
        query = query.eq('active', true);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  }
}