import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db';
import { politicians } from '@shared/schema';

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

async function addMissingPoliticians() {
  try {
    // Read the fixed politicians JSON file
    const fixedJsonPath = path.resolve(__dirname, '../../attached_assets/fixed_politicians.json');
    const fixedJsonData = fs.readFileSync(fixedJsonPath, 'utf8');
    
    // Parse the JSON data
    const fixedData = JSON.parse(fixedJsonData) as PoliticiansJsonFormat;
    
    console.log('Adding missing politicians to database...');
    
    // First, get all politicians from the database
    const dbPoliticians = await db.select().from(politicians);
    console.log(`Found ${dbPoliticians.length} politicians in database`);
    
    // Create a set of existing politician names for quick lookup
    const existingNames = new Set<string>(dbPoliticians.map(p => p.name));
    
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
    
    // Insert politicians that don't exist in the database
    let addedCount = 0;
    for (const politician of allPoliticians) {
      if (!existingNames.has(politician.Name)) {
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
    
    console.log(`Added ${addedCount} new politicians to the database`);
  } catch (error) {
    console.error('Error adding missing politicians:', error);
  }
}

// Main execution
addMissingPoliticians()
  .then(() => console.log('Database update complete'))
  .catch(err => console.error('Error in main execution:', err))
  .finally(() => process.exit(0));