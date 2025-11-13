#!/usr/bin/env node

/**
 * Script to generate Supabase types for the moming schema
 * 
 * Usage:
 *   node scripts/generate-supabase-types.js
 * 
 * This script requires the Supabase CLI to be installed:
 *   npm install -g supabase
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

async function generateTypes() {
  console.log('Generating Supabase types for moming schema...');
  
  try {
    // Check if Supabase CLI is installed
    try {
      await execPromise('supabase --version');
      console.log('✓ Supabase CLI found');
    } catch (error) {
      console.error('✗ Supabase CLI not found. Please install it with:');
      console.error('  npm install -g supabase');
      process.exit(1);
    }
    
    // Generate types for the moming schema
    console.log('Generating types...');
    const { stdout, stderr } = await execPromise(
      'supabase gen types typescript --schema moming --project-id ubnijvfhtmlrnbhoggba',
      { cwd: path.resolve('.') }
    );
    
    if (stderr) {
      console.error('Error generating types:', stderr);
      process.exit(1);
    }
    
    // Write the generated types to the types file
    const typesPath = path.resolve('./src/integrations/supabase/types.ts');
    fs.writeFileSync(typesPath, stdout);
    
    console.log('✓ Types generated successfully at:', typesPath);
    
    // Update the Database type to use moming schema instead of public
    let typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Replace public schema references with moming schema
    typesContent = typesContent.replace(/public:/g, 'moming:');
    typesContent = typesContent.replace(/\["public"\]/g, '["moming"]');
    
    fs.writeFileSync(typesPath, typesContent);
    
    console.log('✓ Types updated to use moming schema');
    console.log('\n✨ Supabase types generation completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated types in src/integrations/supabase/types.ts');
    console.log('2. Restart your development server if it was running');
    console.log('3. Verify that the application works correctly with the new schema');
    
  } catch (error) {
    console.error('Error generating Supabase types:', error.message);
    process.exit(1);
  }
}

// Run the script
generateTypes();