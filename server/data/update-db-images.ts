import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db';
import { politicians } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Get the current file's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the structure of the JSON format
interface PoliticiansJsonFormat {
  knesset_members: {
    Name: string;
    Party: string;
    Position: string;
    ImageUrl: string;
    Aliases: string[];
  }[];
  government_members?: {
    Name: string;
    Party: string;
    Position: string;
    ImageUrl: string;
    Aliases: string[];
  }[];
}

async function updateDatabaseWithImages() {
  try {
    // Read the fixed politicians JSON file
    const fixedJsonPath = path.resolve(__dirname, '../../attached_assets/fixed_politicians.json');
    const fixedJsonData = fs.readFileSync(fixedJsonPath, 'utf8');
    
    // Parse the JSON data
    const fixedData = JSON.parse(fixedJsonData) as PoliticiansJsonFormat;
    
    console.log('Updating database with local image URLs...');
    
    // First, get all politicians from the database
    const dbPoliticians = await db.select().from(politicians);
    console.log(`Found ${dbPoliticians.length} politicians in database`);
    
    // Create a map of politician names to their database IDs
    const politicianMap = new Map<string, number>();
    for (const politician of dbPoliticians) {
      politicianMap.set(politician.name, politician.id);
      console.log(`DB politician: ${politician.name} (${politician.id})`);
    }
    
    // Combine knesset members and government members, removing duplicates
    const allPoliticians = [...fixedData.knesset_members];
    if (fixedData.government_members) {
      for (const govMember of fixedData.government_members) {
        // Only add if not already in the array
        if (!allPoliticians.find(p => p.Name === govMember.Name)) {
          allPoliticians.push(govMember);
        }
      }
    }
    
    // Log all politicians from JSON with images
    for (const politician of allPoliticians) {
      if (politician.ImageUrl && politician.ImageUrl.startsWith('/attached_assets/')) {
        console.log(`JSON politician: ${politician.Name} with image: ${politician.ImageUrl}`);
      }
    }
    
    // Update each politician in the database with the image URL from the JSON
    let updatedCount = 0;
    for (const politician of allPoliticians) {
      const dbId = politicianMap.get(politician.Name);
      
      if (dbId && politician.ImageUrl && politician.ImageUrl.startsWith('/attached_assets/')) {
        console.log(`Updating politician ${politician.Name} (ID: ${dbId}) with image: ${politician.ImageUrl}`);
        
        // Update the database
        await db.update(politicians)
          .set({ 
            // The column is defined as image_url in the database, but accessed as imageUrl in TypeScript
            imageUrl: politician.ImageUrl 
          })
          .where(eq(politicians.id, dbId));
          
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} politicians with local image URLs`);
  } catch (error) {
    console.error('Error updating database with images:', error);
  }
}

// Main execution
updateDatabaseWithImages()
  .then(() => console.log('Database update complete'))
  .catch(err => console.error('Error in main execution:', err))
  .finally(() => process.exit(0));