import * as fs from 'fs';
import * as path from 'path';

interface Politician {
  id: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  rating?: number;
  aliases: string[];
}

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

// Function to load politicians from the JSON file
function loadPoliticiansFromJson(): Politician[] {
  try {
    // First try to load the fixed JSON with updated image URLs
    const jsonPath = path.resolve('./attached_assets/fixed_politicians.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    
    // Parse the JSON data
    const parsedData = JSON.parse(jsonData) as PoliticiansJsonFormat;
    
    console.log('Successfully loaded politicians from fixed_politicians.json');
    
    // Combine both knesset members and government members
    const allPoliticians = [...parsedData.knesset_members];
    if (parsedData.government_members) {
      allPoliticians.push(...parsedData.government_members);
    }
    
    // Convert to our Politician interface format and add IDs
    return allPoliticians.map((politician, index) => ({
      id: index + 1,
      name: politician.Name,
      party: politician.Party,
      position: politician.Position,
      imageUrl: politician.ImageUrl || '',
      aliases: politician.Aliases || []
    }));
  } catch (error) {
    console.error('Failed to load politicians from fixed JSON:', error);
    
    try {
      // Fallback to the original politicians.json file if the fixed one fails
      const fallbackPath = path.resolve('./attached_assets/politicians.json');
      const fallbackData = fs.readFileSync(fallbackPath, 'utf8');
      
      // Parse the fallback JSON data
      const parsedFallback = JSON.parse(fallbackData.replace(/\\/g, '')) as PoliticiansJsonFormat;
      
      console.log('Successfully loaded politicians from fallback politicians.json');
      
      // Combine both knesset members and government members
      const allFallbackPoliticians = [...parsedFallback.knesset_members];
      if (parsedFallback.government_members) {
        allFallbackPoliticians.push(...parsedFallback.government_members);
      }
      
      // Convert to our Politician interface format and add IDs
      return allFallbackPoliticians.map((politician, index) => ({
        id: index + 1,
        name: politician.Name,
        party: politician.Party,
        position: politician.Position,
        imageUrl: politician.ImageUrl || '',
        aliases: politician.Aliases || []
      }));
    } catch (fallbackError) {
      console.error('Failed to load politicians from fallback JSON:', fallbackError);
      // Return empty array if both attempts fail
      return [];
    }
  }
}

// Try to load politicians from JSON file, fall back to hardcoded list if it fails
let knessetMembers: Politician[] = loadPoliticiansFromJson();

// If loading the file failed, use a fallback list
if (knessetMembers.length === 0) {
  console.warn('Using fallback politician data as JSON loading failed');
  knessetMembers = [
    {
      id: 1,
      name: "בנימין נתניהו",
      party: "הליכוד",
      position: "ראש הממשלה",
      imageUrl: "https://drive.google.com/thumbnail?id=17Pc5bPtBPYe0_R32BSkoLGzgN7Xjih_Y&sz=w400",
      aliases: ["ביבי", "נתניהו", "בנימין ביבי נתניהו"]
    },
    {
      id: 2,
      name: "יריב לוין",
      party: "הליכוד",
      position: "שר המשפטים",
      imageUrl: "https://www.gov.il/BlobFolder/roleholder/minister_levin/he/levin.jpg", 
      aliases: ["לוין"]
    },
    {
      id: 3,
      name: "אמיר אוחנה",
      party: "הליכוד",
      position: "יו״ר הכנסת",
      imageUrl: "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/ohana/he/ohana.jpg",
      aliases: ["אוחנה"]
    }
  ];
}

// Export the politicians
export { knessetMembers };