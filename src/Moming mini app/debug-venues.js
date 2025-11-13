// Debug script to test venues component
console.log('Debug script loaded');

// Check if Supabase is available
if (typeof window.supabase !== 'undefined') {
    console.log('Supabase is available');
    
    // Test Supabase connection
    const supabase = supabase.createClient(
        "https://ubnijvfhtmlrnbhoggba.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibmlqdmZodG1scm5iaG9nZ2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTUwMDcsImV4cCI6MjA3NDk5MTAwN30.aCR2IIA8PdvG6tcwszRN8H60UoF0zKWN6jrTy_qbyfE"
    );
    
    // Test fetching venues
    supabase.from('venues').select('*').limit(1).then(result => {
        console.log('Supabase test result:', result);
        if (result.error) {
            console.error('Supabase error:', result.error);
        } else {
            console.log('Supabase success:', result.data);
        }
    });
} else {
    console.log('Supabase is not available');
}

// Check if venues component is available
if (typeof window.venuesComponent !== 'undefined') {
    console.log('Venues component is available');
    console.log('Venues component:', window.venuesComponent);
} else {
    console.log('Venues component is not available');
}

// Check if MoMingData is available
if (typeof window.MoMingData !== 'undefined') {
    console.log('MoMingData is available');
} else {
    console.log('MoMingData is not available');
}