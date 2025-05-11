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

async function updateAllPoliticians() {
  try {
    // Read the fixed politicians JSON file
    const fixedJsonPath = path.resolve(__dirname, '../../attached_assets/fixed_politicians.json');
    const fixedJsonData = fs.readFileSync(fixedJsonPath, 'utf8');
    
    // Parse the JSON data
    const fixedData = JSON.parse(fixedJsonData) as PoliticiansJsonFormat;
    
    console.log('Updating database with new politicians and image URLs...');
    
    // First, get all politicians from the database
    const dbPoliticians = await db.select().from(politicians);
    console.log(`Found ${dbPoliticians.length} politicians in database`);
    
    // Create a map of existing politician names for quick lookup
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
    
    // Process all politicians - update existing ones or add new ones
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const politician of allPoliticians) {
      const dbId = politicianMap.get(politician.Name);
      
      if (dbId) {
        // If the politician exists in database, update their info
        if (politician.ImageUrl && politician.ImageUrl.startsWith('/attached_assets/')) {
          console.log(`Updating politician ${politician.Name} (ID: ${dbId}) with image: ${politician.ImageUrl}`);
          
          // Update the database
          await db.update(politicians)
            .set({ 
              imageUrl: politician.ImageUrl,
              party: politician.Party,
              position: politician.Position
            })
            .where(eq(politicians.id, dbId));
            
          updatedCount++;
        }
      } else {
        // If the politician doesn't exist, add them
        console.log(`Adding new politician: ${politician.Name} with image: ${politician.ImageUrl || 'no image'}`);
        
        // Insert the new politician
        await db.insert(politicians).values({
          name: politician.Name,
          party: politician.Party,
          position: politician.Position,
          imageUrl: politician.ImageUrl,
          mentionCount: 0
        });
        
        addedCount++;
      }
    }
    
    console.log(`Added ${addedCount} new politicians and updated ${updatedCount} existing politicians in the database`);
  } catch (error) {
    console.error('Error updating politicians:', error);
  }
}

// Main execution
updateAllPoliticians()
  .then(() => console.log('Database update complete'))
  .catch(err => console.error('Error in main execution:', err))
  .finally(() => process.exit(0));