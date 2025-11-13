#!/usr/bin/env node

/**
 * Script to update schema references from 'public' to 'moming' in the Supabase types file
 * 
 * Usage:
 *   node scripts/update-schema-references.js
 */

import fs from 'fs';
import path from 'path';

function updateSchemaReferences() {
  console.log('Updating schema references from "public" to "moming"...');
  
  try {
    const typesPath = path.resolve('./src/integrations/supabase/types.ts');
    
    // Check if the file exists
    if (!fs.existsSync(typesPath)) {
      console.error('✗ Types file not found at:', typesPath);
      process.exit(1);
    }
    
    // Read the file content
    let typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Count the number of replacements
    const publicSchemaCount = (typesContent.match(/public:/g) || []).length;
    const publicReferenceCount = (typesContent.match(/\["public"\]/g) || []).length;
    
    console.log(`Found ${publicSchemaCount} "public:" references and ${publicReferenceCount} '["public"]' references`);
    
    // Replace public schema references with moming schema
    typesContent = typesContent.replace(/public:/g, 'moming:');
    typesContent = typesContent.replace(/\["public"\]/g, '["moming"]');
    
    // Write the updated content back to the file
    fs.writeFileSync(typesPath, typesContent);
    
    console.log('✓ Schema references updated successfully');
    console.log('\n✨ Schema reference update completed!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server if it was running');
    console.log('2. Verify that the application works correctly with the new schema');
    
  } catch (error) {
    console.error('Error updating schema references:', error.message);
    process.exit(1);
  }
}

// Run the script
updateSchemaReferences();