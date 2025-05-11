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
    const jsonPath = path.resolve('./attached_assets/politicians.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    
    // Parse the JSON data
    const parsedData = JSON.parse(jsonData.replace(/\\/g, '')) as PoliticiansJsonFormat;
    
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
    console.error('Failed to load politicians from JSON:', error);
    // Return empty array if there's an error
    return [];
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