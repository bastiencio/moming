# MoMing Mini App Integration Guide

This guide explains how to integrate dynamic venue data from your Supabase database into your existing mini app while keeping most of your content static.

## Overview

Your mini app contains comprehensive static content in `data.json` that rarely changes. The integration adds dynamic venue data that can be updated through your admin panel without redeploying the mini app.

## How It Works

1. The venues component fetches data from your Supabase database
2. Only active venues are displayed
3. Content is available in both English and Chinese
4. The component can be embedded anywhere in your mini app

## Integration Steps

### 1. Supabase Setup (Already Done)
- Your Supabase project is already configured with the correct URL and API key
- The venues table has been created with proper RLS policies
- The database connection is working through your admin panel

### 2. Component Integration

To add the venues section to your mini app:

1. **Include the required scripts** (already added to your index.html):
   ```html
   <!-- Supabase CDN -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <!-- Venues component -->
   <script src="./venues-component.js"></script>
   ```

2. **Add a container** where you want to display venues:
   ```html
   <div id="venues-container"></div>
   ```

3. **The component automatically initializes** when the DOM loads

### 3. Using the Component in Your App

You can show the venues section by:
1. Making the container visible: `document.getElementById('venues-container').style.display = 'block';`
2. The language toggle button allows switching between English and Chinese

### 4. Customization

You can customize the component by modifying `venues-component.js`:
- Styling: Modify the CSS in the `addStyles()` method
- Data filtering: Adjust the query in `fetchVenues()`
- Display format: Modify the HTML template in the `render()` method

## Data Structure

The venues component expects data with this structure:
```javascript
{
  id: "uuid",
  name_en: "Venue Name in English",
  name_zh: "场所中文名称", // Optional
  description_en: "Description in English", // Optional
  description_zh: "中文描述", // Optional
  country: "Country Name",
  city: "City Name",
  location: "Specific address", // Optional
  picture_url: "https://example.com/image.jpg", // Optional
  active: true,
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

## Updating Venue Data

To update venue information:
1. Log into your admin panel
2. Navigate to the Venues page
3. Add, edit, or delete venues as needed
4. Changes will automatically appear in your mini app (no redeployment needed)

## Benefits of This Approach

1. **Performance**: Static content loads quickly, dynamic data is fetched only when needed
2. **Maintainability**: Content updates don't require technical changes to the mini app
3. **Flexibility**: You can easily add new venues or update existing ones
4. **Scalability**: The solution can handle any number of venues
5. **Bilingual Support**: Full support for both English and Chinese content

## Troubleshooting

If venues don't appear:
1. Check browser console for errors
2. Verify Supabase connection (network tab)
3. Ensure venues exist in the database and are marked as active
4. Confirm the container element exists with the correct ID

For further assistance, contact your development team.